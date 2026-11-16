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
    if(button){button.disabled=false;button.hidden=false;button.textContent='Instalar aplicativo sem APK';}
    updateNotice('Instale diretamente pelo navegador, sem baixar um arquivo APK.');
  });
  window.addEventListener('appinstalled',()=>{
    deferred=null;
    if(button){button.disabled=true;button.textContent='Aplicativo instalado ✓';}
    updateNotice('Santa Cruz Conecta foi adicionado ao seu dispositivo.');
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
        'No Chrome para Android, toque em ⋮ (menu) e escolha “Instalar app” ou “Adicionar à tela inicial”. Não é necessário baixar APK.' :
        'Abra o menu do navegador e procure “Instalar aplicativo” ou “Adicionar à tela de início”.');
    });
  }
})();
