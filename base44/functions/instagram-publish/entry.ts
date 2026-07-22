import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { mediaUrl, caption, mediaType } = body;

    if (!mediaUrl) return Response.json({ error: 'mediaUrl requis' }, { status: 400 });

    // Récupère le token OAuth Instagram du compte officiel Story221 (SHARED connector)
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('instagram');

    // 1. Récupère l'IG user ID
    const meRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );
    const meData = await meRes.json();
    if (!meData.id) {
      return Response.json({ error: 'Impossible de récupérer le compte Instagram', details: meData }, { status: 500 });
    }
    const igUserId = meData.id;

    // 2. Crée un conteneur média
    const isVideo = mediaType === 'video';
    const containerBody = new URLSearchParams();
    containerBody.append('caption', caption || '');
    containerBody.append('access_token', accessToken);
    if (isVideo) {
      containerBody.append('media_type', 'REELS');
      containerBody.append('video_url', mediaUrl);
    } else {
      containerBody.append('image_url', mediaUrl);
    }

    const containerRes = await fetch(
      `https://graph.instagram.com/v21.0/${igUserId}/media`,
      { method: 'POST', body: containerBody }
    );
    const containerData = await containerRes.json();

    if (!containerData.id) {
      return Response.json({ error: 'Échec de création du conteneur média', details: containerData }, { status: 500 });
    }

    // 3. Publie le conteneur
    const publishBody = new URLSearchParams();
    publishBody.append('creation_id', containerData.id);
    publishBody.append('access_token', accessToken);

    // Pour les vidéos Reels, il faut attendre le traitement avant publication
    if (isVideo) {
      let attempts = 0;
      let status = 'IN_PROGRESS';
      while (status === 'IN_PROGRESS' && attempts < 12) {
        await new Promise((r) => setTimeout(r, 5000));
        const checkRes = await fetch(
          `https://graph.instagram.com/v21.0/${containerData.id}?fields=status_code&access_token=${accessToken}`
        );
        const checkData = await checkRes.json();
        status = checkData.status_code || 'ERROR';
        attempts++;
      }
      if (status !== 'FINISHED') {
        return Response.json({ error: 'Le traitement de la vidéo a échoué ou expiré', status }, { status: 500 });
      }
    }

    const publishRes = await fetch(
      `https://graph.instagram.com/v21.0/${igUserId}/media_publish`,
      { method: 'POST', body: publishBody }
    );
    const publishData = await publishRes.json();

    if (!publishData.id) {
      return Response.json({ error: 'Échec de publication Instagram', details: publishData }, { status: 500 });
    }

    return Response.json({ success: true, postId: publishData.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});