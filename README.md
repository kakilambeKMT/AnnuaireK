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

`NETLIFY_DB_URL` est fourni par Netlify au serveur, jamais livré au navigateur. Les modifications de fiches et de rôles sont protégées contre les requêtes intersites. Les opérations groupées sont transactionnelles. Les API et les pages de connexion ne sont pas mises en cache par le service worker.

Les comptes/membres et les données de l’ancienne version Sites ne sont pas transférés automatiquement. Les préférences locales peuvent être importées via la sauvegarde JSON.

## Développement et vérification

Node.js 24 ou ultérieur : `npm ci`, `npm test`, `npm run build`.
Pour tester les services réels : installer/utiliser la CLI officielle Netlify, lier votre projet et lancer `netlify dev`. Une ouverture de `index.html` ne simule pas Netlify Identity.

Les tests locaux utilisent PostgreSQL embarqué (PGlite) pour les requêtes et transactions et des identités simulées uniquement dans les tests. Ils ne constituent pas une validation des e-mails ni du provisionnement de votre compte Netlify. La mise en service réelle reste à effectuer selon les étapes ci-dessus.

Documentation officielle :
- https://docs.netlify.com/manage/security/secure-access-to-sites/identity/use-identity-in-functions/
- https://docs.netlify.com/build/data-and-storage/netlify-database/migrations/
- https://docs.netlify.com/build/data-and-storage/netlify-database/tooling/
