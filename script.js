const h=document.getElementById('header');
addEventListener('scroll',()=>h.classList.toggle('scrolled',scrollY>70));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
document.getElementById('year').textContent=new Date().getFullYear();
document.getElementById('shopLink').addEventListener('click',e=>{if(e.currentTarget.getAttribute('href')==='#'){e.preventDefault();alert('Add your Naver Smart Store URL here.')}});