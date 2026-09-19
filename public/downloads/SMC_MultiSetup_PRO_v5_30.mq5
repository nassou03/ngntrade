//+------------------------------------------------------------------+
//|                                     SMC_MultiSetup_PRO_v5_30.mq5 |
//|                                  Copyright 2026, SMC Quantitative|
//+------------------------------------------------------------------+
#property copyright "SMC Quantitative"
#property version   "5.30"
#property description "EA SMC QUANT v5.30 - Auto Break-Even & Real Tick Guard"
#property strict
#include <Trade\Trade.mqh>
CTrade trade;
//=== PARAMÈTRES D'ENTRÉE ===
input group "=== Risk & R:R Optimization ==="
input double   InpRiskPercent       = 1.0;      // Risque par trade (%)
input double   InpRR_TP1            = 2.0;      // Target RR TP1 (Clôture Partielle)
input double   InpRR_TP2            = 4.0;      // Target RR TP2 Final
input double   InpClosePercentTP1   = 50.0;     // % Clôture partielle au TP1
input double   InpMinRetracePercent = 35.0;     // Retracement FVG Min (%) requis
input bool     InpAutoBreakEven     = true;     // Déplacer SL au prix d'entrée au TP1
input int      InpMaxSpread         = 70;       // Spread max autorisé (points)
input ulong    InpMagicNumber       = 500730;   // Magic Number
input group "=== Structure & Volatilité ==="
input ENUM_TIMEFRAMES InpHTF       = PERIOD_H1; // Timeframe Biais Structurel
input int      InpSwingPeriod       = 15;       // Période Swing LTF
input int      InpATRPeriod         = 14;       // Période ATR
input double   InpATR_SL_Factor     = 0.7;      // Multiple ATR pour SL
input int      InpMaxWaitBars       = 10;       // Expiration POI (bougies)
input group "=== Filtre de Session (UTC) ==="
input bool     InpUseTimeFilter     = true;     
input int      InpLondonStart       = 7;        // Début Session Londres
input int      InpLondonEnd         = 11;       // Fin Session Londres
input int      InpNYStart           = 13;       // Début Session New York
input int      InpNYEnd             = 18;       // Fin Session New York
// Structures
struct SMC_POI_v5 {
   bool               active;
   ENUM_POSITION_TYPE type;
   double             entryThreshold;
   double             slPrice;
   int                barsLifetime;
};
SMC_POI_v5 g_poi;
datetime   g_last_bar_time = 0;
bool       g_tp1_done      = false;
int        g_atr_handle    = INVALID_HANDLE;
int        g_h1_ma_handle  = INVALID_HANDLE;
int OnInit()
{
   trade.SetExpertMagicNumber(InpMagicNumber);
   g_atr_handle   = iATR(_Symbol, PERIOD_CURRENT, InpATRPeriod);
   g_h1_ma_handle = iMA(_Symbol, InpHTF, 50, 0, MODE_EMA, PRICE_CLOSE);
   if(g_atr_handle == INVALID_HANDLE || g_h1_ma_handle == INVALID_HANDLE)
      return(INIT_FAILED);
   g_poi.active = false;
   return(INIT_SUCCEEDED);
}
void OnDeinit(const int reason)
{
   if(g_atr_handle != INVALID_HANDLE) IndicatorRelease(g_atr_handle);
   if(g_h1_ma_handle != INVALID_HANDLE) IndicatorRelease(g_h1_ma_handle);
}
void OnTick()
{
   ManageActivePosition();
   datetime currentBar = iTime(_Symbol, _Period, 0);
   if(currentBar != g_last_bar_time)
   {
      g_last_bar_time = currentBar;
      if(g_poi.active)
      {
         g_poi.barsLifetime++;
         if(g_poi.barsLifetime > InpMaxWaitBars) g_poi.active = false;
      }
      if(CountOpenPositions() == 0 && !g_poi.active)
      {
         ScanForStructureSetup();
      }
   }
   CheckPOIRetestExecution();
}
void ScanForStructureSetup()
{
   if(!IsTradingAllowed()) return;
   double atrVal[], h1MaVal[];
   ArraySetAsSeries(atrVal, true);
   ArraySetAsSeries(h1MaVal, true);
   if(CopyBuffer(g_atr_handle, 0, 1, 1, atrVal) <= 0 || CopyBuffer(g_h1_ma_handle, 0, 1, 1, h1MaVal) <= 0) return;
   double atr     = atrVal[0];
   double h1Close = iClose(_Symbol, InpHTF, 1);
   bool htfBullish = (h1Close > h1MaVal[0]);
   bool htfBearish = (h1Close < h1MaVal[0]);
   int loIdx = iLowest(_Symbol, _Period, MODE_LOW, InpSwingPeriod, 3);
   int hiIdx = iHighest(_Symbol, _Period, MODE_HIGH, InpSwingPeriod, 3);
   if(loIdx < 0 || hiIdx < 0) return;
   double swingLow  = iLow(_Symbol, _Period, loIdx);
   double swingHigh = iHigh(_Symbol, _Period, hiIdx);
   double bar1Low   = iLow(_Symbol, _Period, 1);
   double bar1High  = iHigh(_Symbol, _Period, 1);
   double bar1Close = iClose(_Symbol, _Period, 1);
   
   double bar2Low   = iLow(_Symbol, _Period, 2);
   double bar2High  = iHigh(_Symbol, _Period, 2);
   double bar2Close = iClose(_Symbol, _Period, 2);
   double bar3High  = iHigh(_Symbol, _Period, 3);
   double bar3Low   = iLow(_Symbol, _Period, 3);
   if(htfBullish && (bar2Low < swingLow && bar2Close > swingLow) && (bar1Close > bar2High))
   {
      double fvgGap = bar1Low - bar3High;
      if(fvgGap > 0)
      {
         double entryTarget = bar1Low - (fvgGap * (InpMinRetracePercent / 100.0));
         double sl          = bar2Low - (atr * InpATR_SL_Factor);
         if(entryTarget > sl)
         {
            g_poi.active         = true;
            g_poi.type           = POSITION_TYPE_BUY;
            g_poi.entryThreshold = entryTarget;
            g_poi.slPrice        = sl;
            g_poi.barsLifetime   = 0;
         }
      }
   }
   if(htfBearish && (bar2High > swingHigh && bar2Close < swingHigh) && (bar1Close < bar2Low))
   {
      double fvgGap = bar3Low - bar1High;
      if(fvgGap > 0)
      {
         double entryTarget = bar1High + (fvgGap * (InpMinRetracePercent / 100.0));
         double sl          = bar2High + (atr * InpATR_SL_Factor);
         if(sl > entryTarget)
         {
            g_poi.active         = true;
            g_poi.type           = POSITION_TYPE_SELL;
            g_poi.entryThreshold = entryTarget;
            g_poi.slPrice        = sl;
            g_poi.barsLived   = 0;
         }
      }
   }
}
void CheckPOIRetestExecution()
{
   if(!g_poi.active || CountOpenPositions() > 0) return;
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   if(g_poi.type == POSITION_TYPE_BUY)
   {
      if(bid <= g_poi.slPrice) { g_poi.active = false; return; }
      if(ask <= g_poi.entryThreshold && ask > g_poi.slPrice)
      {
         double slPoints = MathAbs(ask - g_poi.slPrice) / _Point;
         if(slPoints > 0)
         {
            double tp2 = ask + (slPoints * _Point * InpRR_TP2);
            double lot = CalculateLotSize(slPoints);
            if(trade.Buy(lot, _Symbol, ask, g_poi.slPrice, tp2, "SMC_v530_Buy"))
            {
               g_poi.active = false;
               g_tp1_done   = false;
            }
         }
      }
   }
   else if(g_poi.type == POSITION_TYPE_SELL)
   {
      if(ask >= g_poi.slPrice) { g_poi.active = false; return; }
      if(bid >= g_poi.entryThreshold && bid < g_poi.slPrice)
      {
         double slPoints = MathAbs(g_poi.slPrice - bid) / _Point;
         if(slPoints > 0)
         {
            double tp2 = bid - (slPoints * _Point * InpRR_TP2);
            double lot = CalculateLotSize(slPoints);
            if(trade.Sell(lot, _Symbol, bid, g_poi.slPrice, tp2, "SMC_v530_Sell"))
            {
               g_poi.active = false;
               g_tp1_done   = false;
            }
         }
      }
   }
}
void ManageActivePosition()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket <= 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) == InpMagicNumber && PositionGetString(POSITION_SYMBOL) == _Symbol)
      {
         double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
         double curPrice  = PositionGetDouble(POSITION_PRICE_CURRENT);
         double sl        = PositionGetDouble(POSITION_SL);
         double tp        = PositionGetDouble(POSITION_TP);
         double vol       = PositionGetDouble(POSITION_VOLUME);
         ENUM_POSITION_TYPE type = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
         double slDist = MathAbs(openPrice - sl);
         if(!g_tp1_done)
         {
            bool tp1Reached = (type == POSITION_TYPE_BUY) ? (curPrice >= openPrice + slDist * InpRR_TP1)
                                                         : (curPrice <= openPrice - slDist * InpRR_TP1);
            if(tp1Reached)
            {
               double stepLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
               double closeVol = NormalizeDouble(vol * (InpClosePercentTP1 / 100.0), 2);
               closeVol = MathFloor(closeVol / stepLot) * stepLot;
               if(closeVol >= SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN))
               {
                  if(trade.PositionClosePartial(ticket, closeVol))
                  {
                     g_tp1_done = true;
                     double newSL = InpAutoBreakEven ? openPrice : sl;
                     trade.PositionModify(ticket, newSL, tp);
                  }
               }
            }
         }
      }
   }
}
bool IsTradingAllowed()
{
   if(SymbolInfoInteger(_Symbol, SYMBOL_SPREAD) > InpMaxSpread) return false;
   if(InpUseTimeFilter)
   {
      MqlDateTime dt;
      TimeToStruct(TimeCurrent(), dt);
      bool isLondon = (dt.hour >= InpLondonStart && dt.hour < InpLondonEnd);
      bool isNY     = (dt.hour >= InpNYStart     && dt.hour < InpNYEnd);
      if(!isLondon && !isNY) return false;
   }
   return true;
}
int CountOpenPositions()
{
   int count = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(PositionGetTicket(i) > 0)
      {
         if(PositionGetInteger(POSITION_MAGIC) == InpMagicNumber && PositionGetString(POSITION_SYMBOL) == _Symbol)
            count++;
      }
   }
   if(count == 0) g_tp1_done = false;
   return count;
}
double CalculateLotSize(double slPoints)
{
   if(slPoints <= 0) return SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double balance     = AccountInfoDouble(ACCOUNT_BALANCE);
   double riskAmount  = balance * (InpRiskPercent / 100.0);
   double tickValue   = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double tickSize    = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   double point       = SymbolInfoDouble(_Symbol, SYMBOL_POINT);
   if(tickSize <= 0 || point <= 0) return SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double valuePerPoint = tickValue * (point / tickSize);
   double rawLot        = riskAmount / (slPoints * valuePerPoint);
   double minLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double maxLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   double stepLot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   double lot = MathFloor(rawLot / stepLot) * stepLot;
   if(lot < minLot) lot = minLot;
   if(lot > maxLot) lot = maxLot;
   return lot;
}
