// Translate controls only; the designer's artwork, English learning words and brand names stay intact.
const labels = {
  'sign in':'ログイン', 'create account':'アカウントを作成', 'continue as guest':'ゲストで試す',
  'continue':'次へ', 'back':'戻る', 'cancel':'キャンセル', 'save':'保存', 'send':'送信',
  'AI notes':'AIノート', 'test':'テスト', 'progress':'学習記録', 'my page':'マイページ',
};
function translateControls(){
  document.documentElement.lang='ja';
  document.querySelectorAll('button').forEach(button=>{
    const label=labels[button.textContent.trim()];
    if(label && button.children.length===0) button.textContent=label;
  });
}
addEventListener('DOMContentLoaded',()=>{
  const root=document.body;
  if(!root)return; // A rapid return may already have unloaded the prototype.
  translateControls();
  const observer=new MutationObserver(translateControls);
  observer.observe(root,{childList:true,subtree:true});
  addEventListener('pagehide',()=>observer.disconnect(),{once:true});
});
