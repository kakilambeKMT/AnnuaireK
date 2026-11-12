# L’annuaire K — pack complet Netlify

Un seul projet contient la PWA, les comptes, le backend, la base partagée et l’administration. Aucun compte ChatGPT ni service Sites n’est nécessaire.

## Publier le pack complet

1. Décompresser ce pack et placer son contenu dans un dépôt Git privé. Importer ce dépôt dans Netlify. La configuration `netlify.toml` définit la commande `npm run build`, le dossier public `public` et les fonctions serveur.
2. Dans Netlify, activer **Identity**, autoriser les inscriptions et **garder la confirmation d’e-mail obligatoire** (autoconfirm désactivé). Le serveur refuse d’ouvrir les inscriptions si la confirmation est désactivée.
3. Vérifier que **Netlify Database** est provisionnée (Data & Storage > Database). Le module `@netlify/database` est déclaré pour le provisionnement. Les migrations SQL de `netlify/database/migrations` sont appliquées par Netlify au déploiement. Ne pas exécuter les migrations directement contre la base hébergée.
4. Déployer. Vérifier `/api/health` : la réponse attendue est `ready: true`. Si ce n’est pas le cas, ne pas annoncer les inscriptions ouvertes ; vérifier Identity, la base et les journaux de migration.
5. Créer et confirmer par e-mail les comptes fondateurs : `kakilambeprod@gmail.com` et `kakikamademia@gmail.com`. Ils deviennent respectivement propriétaire et administrateur lors de leur première connexion confirmée à l’application. Les fiches fondatrices sont rattachées automatiquement à leur compte.
6. Tester une inscription avec un autre compte : soumission, absence du catalogue public avant validation, approbation par l’administration, puis visibilité publique. Les deux administrateurs peuvent nommer ce membre modérateur. Un modérateur ne peut pas attribuer de droits.
7. Installer la PWA depuis Chrome/Edge ou « Sur l’écran d’accueil » dans Safari. Revenir après une première ouverture pour vérifier le mode hors ligne.

**Ne pas déposer uniquement `public/` ou un HTML dans Netlify Drop** : le dépôt statique ne déploie pas les fonctions serveur et leurs migrations. Utiliser le projet complet avec la construction Netlify. L’activation des services requiert votre compte Netlify ; ce ZIP ne peut ni créer votre compte ni accepter les conditions ou choisir une offre à votre place.

## Ce qui est inclus

- Interface, carte OpenStreetMap, recherche, Match K, comparaison, PWA et téléchargements.
- Comptes avec confirmation d’e-mail, connexion, récupération du mot de passe, déconnexion.
- Activités partagées en base PostgreSQL, brouillons, soumission, validation, corrections et masquage.
- Deux administrateurs fondateurs, gestion des modérateurs, contrôles d’accès serveur et journal d’audit.
- Kakilambe Prod SARLU, Kamademia et Makiti ; attribution de l’initiative à Kakiverse, Kaki Makiti et Kamademia.

Les notes, favoris, brouillons de messages et projets d’opportunités restent locaux. Ce pack ne prétend pas fournir une messagerie communautaire ou des événements partagés. Le fond de carte nécessite Internet. Un HTML ouvert depuis le disque peut préparer une fiche mais ne peut pas remplacer un serveur connecté.

## Sécurité et données

Netlify Identity vérifie la session. Les en-têtes d’identité éventuellement envoyés par un visiteur sont effacés, puis reconstruits uniquement après vérification serveur. Les rôles sont en base, jamais dans les champs du formulaire ni dans une préférence locale. Les administrateurs doivent confirmer leur adresse. Aucun mot de passe ni secret n’est intégré au pack.

La connexion à la base est fournie par Netlify au serveur via le client officiel `@netlify/database`, jamais livrée au navigateur. Les modifications de fiches et de rôles sont protégées contre les requêtes intersites. Les opérations groupées sont transactionnelles. Les API et les pages de connexion ne sont pas mises en cache par le service worker.

Les comptes/membres et les données de l’ancienne version Sites ne sont pas transférés automatiquement. Les préférences locales peuvent être importées via la sauvegarde JSON.

## Développement et vérification

Node.js 24 ou ultérieur : `npm ci`, `npm test`, `npm run build`.
Pour tester les services réels : installer/utiliser la CLI officielle Netlify, lier votre projet et lancer `netlify dev`. Une ouverture de `index.html` ne simule pas Netlify Identity.

Les tests locaux utilisent PostgreSQL embarqué (PGlite) pour les requêtes et transactions et des identités simulées uniquement dans les tests. Ils ne constituent pas une validation des e-mails ni du provisionnement de votre compte Netlify. La mise en service réelle reste à effectuer selon les étapes ci-dessus.

Documentation officielle :
- https://docs.netlify.com/manage/security/secure-access-to-sites/identity/use-identity-in-functions/
- https://docs.netlify.com/build/data-and-storage/netlify-database/migrations/
- https://docs.netlify.com/build/data-and-storage/netlify-database/tooling/

## Mise à jour du 12 novembre 2026 — confort et annonces
Mode jour sauge grisé, surfaces feutrées, textes agrandis, boutons tactiles et disposition mobile à une colonne. Carte conservée. WhatsApp facultatif sur les fiches et annonces, au format international.
Annonces gratuites (30 jours), mise en avant (7 jours), Pass Pro (30 jours, renouvellement manuel) et espaces sponsorisés (30 jours). Toutes les demandes sont modérées ; les offres payantes passent par un devis, puis une vérification manuelle du paiement réel par l’un des deux administrateurs. Les annonces sponsorisées sont signalées et classées en priorité. Une annonce publiée peut être retirée, sa référence de paiement est conservée et ne peut pas servir une deuxième fois.
Les pays ne sont pas restreints : toute l’Afrique francophone peut déposer une demande. Les préférences Mobile Money ne constituent pas une connexion à un opérateur. Aucun paiement automatique, prélèvement récurrent ou réseau publicitaire tiers n’est activé. PayPal prévu pour le propriétaire : kakilambeprod@gmail.com ; l’adresse seule n’active pas une API de paiement. Les administrateurs doivent communiquer des instructions marchandes vérifiées, adaptées au pays et à la devise.
Le Pass Pro actuel est une présence sponsorisée à durée fixe, pas encore un abonnement avec renouvellement automatique. La publicité rapporte uniquement si des annonceurs achètent effectivement des placements.
Déploiement : réunir les deux modules dans le même projet Netlify ; configurer Identity (confirmation e-mail obligatoire) et Database, puis exécuter le build. La migration 0002_announcements.sql doit être appliquée avec 0001. Le HTML seul permet l’aperçu ; il n’active pas les services.
Validation locale : 11 tests automatisés passent, compilation et syntaxe vérifiées. Le navigateur de contrôle n’a pas pu joindre le nouveau serveur local : validation visuelle desktop/mobile et essais sur un vrai projet Netlify restent à effectuer. L’ancien aperçu Sites n’a pas été redéployé.

## Personnalisation des fiches
Logo facultatif et galerie de 3 photos. Sans logo, la première photo illustre la carte. Les images importées sont redimensionnées à 800 pixels maximum et compressées localement (100 Ko maximum chacune). Note vocale facultative à importer depuis le téléphone, 600 Ko maximum, formats MP3, OGG, WAV, WebM et M4A. Pas d’enregistrement micro intégré dans cette version. Lecture audio uniquement sur demande, sans préchargement.
Les médias sont conservés avec la fiche dans la base Netlify et servis par une route distincte ; ils ne sont pas inclus dans le catalogue JSON public. Aucun stockage supplémentaire à configurer. Les brouillons restent accessibles uniquement à leur propriétaire et à la modération. Une modification repasse par validation. Les types, tailles et signatures des fichiers sont contrôlés côté serveur. Les médias publics ne sont pas mis en cache hors ligne.
« Match K » est renommé « Trouver un professionnel » (navigation mobile : « Trouver un pro »). L’ancienne adresse #match reste compatible.
12 tests automatisés passent, dont la validation des médias, la confidentialité avant publication et le retrait après modification. Contrôle visuel sur appareil et déploiement Netlify non réalisés dans cette livraison.

## Accueil mobile, assistance et confiance — 12 novembre 2026
- Accueil avec recherche « Que cherchez-vous ? », domaine, ville et carte interactive, puis fiches. Carte et résultats partagent les critères. Navigation mobile à cinq entrées. Inspiration de parcours : https://www.planity.com/ (recherche quoi/où), identité visuelle K conservée.
- Quatre palettes jour mémorisées sur l’appareil : sauge, sable, océan, prune. Mode nuit conservé. La carte OpenStreetMap nécessite Internet ; les positions sont des centres de villes connues, pas des adresses commerciales vérifiées.
- Admins et modérateurs : bouton « Aider à modifier » depuis l’administration. Édition de la fiche sans transfert de propriétaire, journalisée, retour en validation. Une modification retire le badge jusqu’à nouvelle vérification.
- Sites sans protocole acceptés : cerveau-libere.com devient https://cerveau-libere.com/. Cela valide le format, pas la disponibilité du site.
- Données d’entreprise (raison sociale, immatriculation, pays, registre) privées. L’administrateur vérifie le registre avant de délivrer le badge. Déclarer des données ne donne jamais automatiquement le badge. Il atteste ce contrôle d’immatriculation, pas la qualité du service.
- Contacts et demandes de rendez-vous accessibles aux membres. Un retour est obligatoire avant le prochain contact : note après échange réel, ou « aucun échange réalisé / annulé » sans note. Un seul contact en attente par compte, contrôlé en base même pour deux demandes simultanées. Un avis par compte et activité (le nouveau remplace l’ancien), pas d’auto-évaluation de sa propre activité. Aucun achat ou rendez-vous n’est vérifié automatiquement. Les coordonnées publiques et les échanges hors plateforme restent hors du contrôle de cette règle.
- Les rendez-vous sont des demandes à convenir directement, sans réservation de créneau ni calendrier professionnel dans cette version.
- Régie confiance : notes agrégées, alerte à partir de cinq notes de 1–2 étoiles constituant au moins la moitié des avis. Cette alerte ne sanctionne pas automatiquement. Administrateurs seulement : rétrogradation, avertissement public motivé, suspension de 1 à 90 jours, exclusion de la fiche ou levée de mesure. Ces mesures concernent la fiche ; elles ne bannissent pas le compte de connexion. Les propriétaires voient le motif et peuvent transmettre un recours. L’équipe peut réexaminer et lever la mesure. La suspension expire automatiquement à la lecture du catalogue.
- Migration nouvelle obligatoire : netlify/database/migrations/0003_trust.sql. Conserver les migrations 0001 et 0002. Déployer interface et backend ensemble.
- Validation : 16 tests passent (rôles, données, médias, assistance, avis, concurrence, sanctions, recours et génération des interfaces). Compilation réussie. Le contrôle visuel réel mobile/desktop reste à effectuer : accès HTTP local précédemment indisponible, ouverture du fichier bloquée par la politique du navigateur. Aucun déploiement de l’ancien aperçu Sites réalisé.
