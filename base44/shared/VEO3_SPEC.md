# STORY221 — RÔLE COMPLET DE L'API GOOGLE VEO 3 (VEO 3.1)

## Spécification technique du moteur d'exécution vidéo

---

## 1. Position dans l'architecture

Veo 3 (actuellement en version 3.1) est le **moteur d'exécution vidéo** de Story221 : il ne prend jamais de décision créative lui-même. Il reçoit de Claude des instructions déjà structurées — scène par scène, avec description visuelle précise, dialogues, ambiance sonore attendue — et produit le rendu vidéo final avec son audio synchronisé.

**Chaîne de responsabilité :**
Claude (comprend, écrit, structure) → Gemini (exécute les tâches de génération de texte/image/orchestration intermédiaire) → **Veo 3 (génère le rendu vidéo + audio synchronisé final)** → Claude (contrôle qualité).

---

## 2. Capacités réelles de Veo 3.1 à exploiter

- **Génération de clips de 8 secondes** par appel, en résolution 720p, 1080p ou 4K.
- **Audio natif synchronisé en un seul passage** : dialogues, effets sonores, ambiance — généré en même temps que l'image, sans étape de post-production audio séparée.
- **Deux modes d'entrée** : texte vers vidéo, et image vers vidéo (utile pour animer un personnage déjà généré ou une image de référence uploadée).
- **Jusqu'à 3 images de référence** peuvent être fournies pour guider l'apparence d'un personnage ou d'un décor — mécanisme technique exact pour garantir la fidélité visuelle.
- **Génération avec image de début et de fin spécifiées** ("Frame-specific generation") : permet de contrôler précisément comment une scène commence et se termine.
- **Fonction "Extend"** : prolonge un clip déjà généré en conservant le mouvement et la cohérence narrative.
- **Formats portrait (9:16) et paysage (16:9)**, correspondant aux formats Reels vertical et horizontal classique.
- **Filigrane SynthID** : chaque vidéo générée par Veo 3 est marquée par un tatouage numérique invisible identifiant son origine IA.

---

## 3. Gestion des vidéos longues (1 à 10 minutes)

Veo 3 génère nativement des clips de 8 secondes. Le pipeline doit **enchaîner plusieurs générations** pour construire une vidéo longue :

1. Claude découpe le scénario en scènes, chacune sous-découpée en segments de 8 secondes maximum.
2. Pour chaque nouveau segment, les **images de référence** du personnage/décor (jusqu'à 3) sont systématiquement fournies à Veo 3, en s'appuyant sur les toutes dernières images générées du segment précédent, pour garantir une continuité visuelle stricte.
3. Quand la continuité d'un même plan doit se poursuivre au-delà de 8 secondes sans coupure, la fonction **Extend** est utilisée en priorité plutôt qu'une nouvelle génération indépendante.
4. Quand deux scènes s'enchaînent avec une coupure ou une transition, la **génération avec image de fin spécifiée** de la scène précédente sert d'image de départ à la scène suivante.
5. L'assemblage final de tous les segments est réalisé par l'étape de montage automatique du pipeline.

**Conséquence sur le coût en diamants :** une vidéo de 10 minutes nécessite un nombre de générations Veo 3 nettement supérieur à une vidéo de 1 minute — le barème de diamants par minute doit intégrer ce coût réel en nombre d'appels API.

---

## 4. Intégration technique

- Accès via l'**API Gemini** (endpoint de génération vidéo) ou via **Vertex AI** pour les besoins de production à grande échelle (recommandé dès que le volume d'utilisateurs devient significatif).
- **Facturation à la seconde de vidéo générée**, avec un supplément pour l'audio natif — ce coût réel doit être suivi précisément dans le module Analytics du Super Admin.
- Les clés d'accès à l'API Veo 3/Vertex AI doivent être stockées exclusivement dans les Secrets/variables d'environnement, jamais codées en dur.

---

## 5. Complémentarité avec les autres briques audio

Même si Veo 3 génère un audio natif synchronisé, Story221 doit conserver la possibilité pour l'utilisateur de :
- Remplacer la voix générée par une voix choisie dans la galerie de voix de la plateforme (y compris en wolof, si Veo 3 ne couvre pas nativement cette langue avec une qualité suffisante).
- Ajouter une musique de fond personnalisée par-dessus l'audio natif.
- Utiliser la fonction "Régénérer et tout synchroniser" pour resynchroniser un remplacement audio sans regénérer l'image.

---

## 6. Sécurité, modération et transparence

- Veo 3 applique ses propres filtres de sécurité intégrés côté Google — Story221 garde ses propres garde-fous en complément (personnes réelles, marques réelles, catégories sensibles).
- Le filigrane SynthID présent sur chaque vidéo générée doit être conservé tel quel — ne jamais tenter de le supprimer ou de le masquer.
- Une mention discrète "Contenu généré par IA" doit être prévue dans l'interface de lecture des Reels, cohérente avec la présence du filigrane.

---

## 7. Suivi des coûts API réels

- Suivi des coûts API réels par génération (pour alimenter le module Analytics du Super Admin et ajuster dynamiquement le barème diamants/minute si l'écart avec le coût réel devient significatif).
- Segments Veo 3 : génération liée à une scène, durée, résolution, images de référence utilisées, statut, coût réel en API.

---

## 8. Tests obligatoires

- Enchaînement réussi de plusieurs segments de 8 secondes en une vidéo continue de 1, 5 et 10 minutes, sans saut visuel perceptible.
- Fidélité du personnage maintenue sur l'ensemble des segments grâce aux images de référence.
- Qualité de l'audio natif en français, anglais et wolof — si le wolof n'est pas nativement bien supporté, basculer sur le système de voix propre à Story221.
- Suivi correct du coût API réel par génération, comparé au coût en diamants facturé.
- Présence systématique et non altérée du filigrane SynthID sur chaque export final.

---

## 9. Mode Production

Aucune génération Veo 3 simulée. Le suivi des coûts API doit refléter la facturation réelle du prestataire — ce point conditionne directement la rentabilité du barème de diamants et doit être surveillé en continu dès le lancement.