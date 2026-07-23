import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { videoUrl, caption, mediaType = 'video' } = body;

    if (!videoUrl) return Response.json({ error: 'videoUrl requis' }, { status: 400 });

    // Lire les paramètres de publication auto
    const settings = await base44.asServiceRole.entities.AppSetting.list();
    const get = (key) => settings.find(s => s.key === key)?.value;

    const instagramEnabled = get('autopublish_instagram') === 'true';
    const facebookEnabled = get('autopublish_facebook') === 'true';
    const tiktokEnabled = get('autopublish_tiktok') === 'true';
    const youtubeEnabled = get('autopublish_youtube') === 'true';

    const results = {};

    // --- Instagram (connecteur autorisé) ---
    if (instagramEnabled) {
      try {
        const { accessToken } = await base44.asServiceRole.connectors.getConnection('instagram');

        const meRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
        const meData = await meRes.json();

        if (!meData.id) {
          results.instagram = { success: false, error: 'Compte Instagram introuvable' };
        } else {
          // Créer le conteneur média
          const containerBody = new URLSearchParams();
          containerBody.append('caption', caption || '');
          containerBody.append('access_token', accessToken);

          if (mediaType === 'video') {
            containerBody.append('media_type', 'REELS');
            containerBody.append('video_url', videoUrl);
          } else {
            containerBody.append('image_url', videoUrl);
          }

          const containerRes = await fetch(`https://graph.instagram.com/v21.0/${meData.id}/media`, {
            method: 'POST',
            body: containerBody,
          });
          const containerData = await containerRes.json();

          if (!containerData.id) {
            results.instagram = { success: false, error: 'Échec conteneur média', details: containerData };
          } else {
            // Pour les vidéos, attendre le traitement
            if (mediaType === 'video') {
              let attempts = 0;
              let status = 'IN_PROGRESS';
              while (status === 'IN_PROGRESS' && attempts < 12) {
                await new Promise(r => setTimeout(r, 5000));
                const checkRes = await fetch(`https://graph.instagram.com/v21.0/${containerData.id}?fields=status_code&access_token=${accessToken}`);
                const checkData = await checkRes.json();
                status = checkData.status_code || 'ERROR';
                attempts++;
              }
              if (status !== 'FINISHED') {
                results.instagram = { success: false, error: 'Traitement vidéo échoué', status };
              }
            }

            if (!results.instagram || results.instagram.success !== false) {
              const publishBody = new URLSearchParams();
              publishBody.append('creation_id', containerData.id);
              publishBody.append('access_token', accessToken);

              const publishRes = await fetch(`https://graph.instagram.com/v21.0/${meData.id}/media_publish`, {
                method: 'POST',
                body: publishBody,
              });
              const publishData = await publishRes.json();

              if (publishData.id) {
                results.instagram = { success: true, postId: publishData.id };
              } else {
                results.instagram = { success: false, error: 'Échec publication', details: publishData };
              }
            }
          }
        }
      } catch (err) {
        results.instagram = { success: false, error: err.message };
      }
    }

    // --- Facebook Pages (connecteur requis) ---
    if (facebookEnabled) {
      try {
        const { accessToken } = await base44.asServiceRole.connectors.getConnection('facebook_pages');
        // Lister les pages gérées
        const pagesRes = await fetch(`https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token&access_token=${accessToken}`);
        const pagesData = await pagesRes.json();

        if (pagesData.data && pagesData.data.length > 0) {
          const page = pagesData.data[0]; // Première page
          const pageToken = page.access_token;

          // Pour les vidéos, utiliser /page/videos
          if (mediaType === 'video') {
            const videoBody = new URLSearchParams();
            videoBody.append('file_url', videoUrl);
            videoBody.append('description', caption || '');
            videoBody.append('access_token', pageToken);

            const videoRes = await fetch(`https://graph.facebook.com/v25.0/${page.id}/videos`, {
              method: 'POST',
              body: videoBody,
            });
            const videoData = await videoRes.json();

            if (videoData.id) {
              results.facebook = { success: true, postId: videoData.id, pageName: page.name };
            } else {
              results.facebook = { success: false, error: 'Échec publication vidéo', details: videoData };
            }
          } else {
            // Pour les images
            const photoBody = new URLSearchParams();
            photoBody.append('url', videoUrl);
            photoBody.append('caption', caption || '');
            photoBody.append('access_token', pageToken);

            const photoRes = await fetch(`https://graph.facebook.com/v25.0/${page.id}/photos`, {
              method: 'POST',
              body: photoBody,
            });
            const photoData = await photoRes.json();

            if (photoData.id) {
              results.facebook = { success: true, postId: photoData.id, pageName: page.name };
            } else {
              results.facebook = { success: false, error: 'Échec publication photo', details: photoData };
            }
          }
        } else {
          results.facebook = { success: false, error: 'Aucune page Facebook gérée' };
        }
      } catch (err) {
        results.facebook = { success: false, error: err.message };
      }
    }

    // --- TikTok (connecteur en lecture seule, publication non supportée) ---
    if (tiktokEnabled) {
      results.tiktok = { success: false, error: 'Le connecteur TikTok ne supporte que la lecture, pas la publication' };
    }

    // --- YouTube (aucun connecteur disponible) ---
    if (youtubeEnabled) {
      results.youtube = { success: false, error: 'Aucun connecteur YouTube disponible sur la plateforme' };
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});