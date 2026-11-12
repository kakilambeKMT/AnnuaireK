(() => {
  const extra = ['Agriculture & élevage','Architecture & construction','Automobile & transport','Banque & finance','BTP & immobilier','Commerce & distribution','Communication & médias','Droit & juridique','Éducation & formation','Énergie & environnement','Événementiel','Hôtellerie & tourisme','Industrie & fabrication','Informatique & télécoms','Logistique & livraison','Marketing & publicité','Médecine & santé','ONG & impact social','Ressources humaines','Sécurité','Services à domicile','Sport & loisirs','Traduction & langues','Art & spectacle','Sciences & recherche'];
  KDATA.categories = [...new Set([...KDATA.categories, ...extra])];
})();
