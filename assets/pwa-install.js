/* Instalação via navegador, sem APK e sem desativar proteções Android. */
(()=>{
  'use strict';
  let deferred=null;
  const button=document.getElementById('installPwa');
  const notice=document.getElementById('installNotice');
  const updateNotice=text=>{if(notice){notice.textContent=text;notice.hidden=false;}};
  const standalone=window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if('serviceWorker' in navigator && window.isSecureContext){
    window.addEventListener('load',()=>{
      navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(err=>{
        console.warn('Santa Cruz Conecta: não foi possível registrar a instalação offline.',err);
      });
    });
  }
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    deferred=event;
    if(button){button.disabled=false;button.hidden=false;button.textContent='Instalar Santa Cruz Conecta';}
    updateNotice('O Chrome identificou o Santa Cruz Conecta como aplicativo instalável, com nosso ícone próprio. Use a opção Instalar.');
  });
  window.addEventListener('appinstalled',()=>{
    deferred=null;
    if(button){button.disabled=true;button.textContent='Aplicativo instalado ✓';}
    updateNotice('Santa Cruz Conecta foi adicionado ao seu dispositivo.');
    // Métrica anônima: registrar apenas o evento de instalação, sem dados do dispositivo.
    // Nem todo navegador emite "appinstalled"; o total é aproximado.
    const config=window.SC_SUPABASE||{};
    const base=String(config.url||'').replace(/\/+$/,'');
    const key=String(config.publishableKey||'');
    if(/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base)&&key.startsWith('sb_publishable_')){
      const marker='scc:pwa-installed:v1';
      let shouldRecord=true;
      try {
        if(localStorage.getItem(marker)==='1')shouldRecord=false;
        else localStorage.setItem(marker,'1');
      }catch{/* Instalação não depende de armazenamento local */}
      if(shouldRecord){
        const platform=/Android/i.test(navigator.userAgent)?'android':'desktop';
        fetch(base+'/rest/v1/pwa_install_events',{
          method:'POST',
          headers:{apikey:key,'Content-Type':'application/json','Prefer':'return=minimal'},
          body:JSON.stringify({platform}),keepalive:true
        }).catch(()=>{/* A medição nunca deve impedir instalação */});
      }
    }
    window.dispatchEvent(new CustomEvent('scc:pwa-installed'));
  });
  if(button){
    if(standalone){
      button.disabled=true;
      button.textContent='Aplicativo já instalado ✓';
      updateNotice('Você já está usando o Santa Cruz Conecta como aplicativo.');
    }
    button.addEventListener('click',async()=>{
      if(standalone)return;
      if(deferred){
        const prompt=deferred;
        deferred=null;
        try{
          await prompt.prompt();
          const choice=await prompt.userChoice;
          if(choice?.outcome!=='accepted')updateNotice('Instalação cancelada. Você pode tentar pelo menu do navegador.');
        }catch(e){updateNotice('Não foi possível abrir a instalação automática. Use o menu do navegador.');}
        return;
      }
      const isAndroid=/Android/i.test(navigator.userAgent);
      updateNotice(isAndroid ?
        'No Chrome, abra ⋮ e escolha “Instalar app” ou “Instalar aplicativo”. Se aparecer apenas “Adicionar à tela inicial”, isso poderá criar um atalho com o símbolo do Chrome; não é o mesmo tipo de instalação. Confira se o Chrome está atualizado.' :
        'No menu do navegador, escolha “Instalar aplicativo”. Um simples atalho pode continuar mostrando a marca do navegador.');
    });
  }
})();
