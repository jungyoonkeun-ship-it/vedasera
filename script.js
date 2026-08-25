document.getElementById("year").textContent = new Date().getFullYear();

const menu = document.querySelector(".menu");
const mobile = document.querySelector(".mobile-nav");
menu.addEventListener("click", () => {
  const open = mobile.classList.toggle("open");
  menu.setAttribute("aria-expanded", open ? "true" : "false");
  mobile.setAttribute("aria-hidden", open ? "false" : "true");
});

mobile.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  mobile.classList.remove("open");
  menu.setAttribute("aria-expanded","false");
  mobile.setAttribute("aria-hidden","true");
}));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add("visible");
  });
},{threshold:.08});

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
