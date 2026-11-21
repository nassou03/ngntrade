/**
 * Images pleine résolution de la session en cours (non persistées).
 * L'historique ne garde que des miniatures ; ici on garde l'image nette
 * pour que le graphique annoté reste lisible juste après l'analyse.
 */
export const sessionImages = new Map<string, string>();
