/* Métrica de intenção de download: não identifica instalações, downloads completos ou pessoas. */
(()=>{
  'use strict';
  const button=document.getElementById('downloadApk');
  const notice=document.getElementById('downloadNotice');
  const pub=window.SC_SUPABASE||{};
  const base=String(pub.url||'').replace(/\/+$/,'');
  const key=String(pub.publishableKey||'');
  if(!button)return;
  button.addEventListener('click',()=>{
    const marker='scc:apk:android-v1.0.0-beta.1';
    try{
      const last=Number(sessionStorage.getItem(marker)||0);
      if(Date.now()-last<120000)return;
      sessionStorage.setItem(marker,String(Date.now()));
    }catch{}
    if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base)||!key.startsWith('sb_publishable_'))return;
    fetch(base+'/rest/v1/android_download_events',{
      method:'POST',
      headers:{apikey:key,'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify({app_version:'android-v1.0.0-beta.1',source:'site'}),
      keepalive:true
    }).catch(()=>{notice.textContent='O arquivo foi solicitado. A contagem pode não ter sido registrada.';});
  });
})();