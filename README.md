# Site Web du Zoo Arcadia

Ce projet est une application web moderne pour le Zoo Arcadia, construite avec React et Remix, Node.js, et PostgreSQL. Elle vise à offrir une expérience en ligne engageante pour les visiteurs du zoo et un système de gestion efficace pour le personnel.

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)
- [Développement](#développement)
- [Déploiement](#déploiement)
- [Contribution](#contribution)
- [Licence](#licence)

## Fonctionnalités

- Design responsive pour une visualisation optimale sur tous les appareils
- Carte interactive du zoo
- Pages d'information sur les animaux et les habitats
- Tableau de bord administratif pour la gestion du zoo
- Authentification et autorisation des utilisateurs
- Section blog/actualités pour les mises à jour du zoo

## Technologies utilisées

- Frontend : React.js avec Remix
- Backend : Node.js
- Base de données : PostgreSQL avec Prisma ORM
- Styles : Tailwind CSS
- Authentification : JWT
- Tests : Cypress

## Démarrage

1. Clonez le dépôt
2. Installez les dépendances :
   ```
   npm install
   ```
3. Configurez vos variables d'environnement dans un fichier `.env` (utilisez `.env.example` comme modèle)
4. Initialisez la base de données :
   ```
   npx prisma migrate dev
   ```
5. Démarrez le serveur de développement :
   ```
   npm run dev
   ```

## Structure du projet

Le projet suit la convention de routage basée sur les fichiers de Remix. Les répertoires clés incluent :

- `app/` : Contient le code principal de l'application
- `app/routes/` : Définit les routes de l'application
- `app/components/` : Composants React réutilisables
- `app/utils/` : Fonctions utilitaires et code côté serveur
- `prisma/` : Schéma de base de données et migrations

Pour une structure de fichiers détaillée, référez-vous à `architecture.md`.

## Développement

Pour exécuter le projet en mode développement :

```
npm run dev
```

Pour le linting :

```
npm run lint
```

Pour la vérification des types :

```
npm run typecheck
```

## Déploiement

Le projet est configuré pour le déploiement. Pour construire pour la production :

```
npm run build
```

Pour démarrer le serveur de production :

```
npm start
```

## Contribution

Les contributions sont les bienvenues ! Veuillez lire nos directives de contribution (lien vers CONTRIBUTING.md) avant de soumettre des pull requests.

## Licence

Ce projet est sous licence [MIT](LICENSE).

---

Pour des informations plus détaillées sur la conception du projet, le processus de développement et les défis rencontrés, veuillez vous référer aux documents suivants :

- [Introduction](introduction.md)
- [Analyse](analyse.md)
- [Conception](conception.md)
- [Développement](developpement.md)
- [Difficultés et Solutions](difficultes_solutions.md)
- [Conclusion](conclusion.md)

