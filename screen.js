
let currentScreen = 'screen-login';

function backToSearch(){
    navigate('screen-login', 'screen-folders');
}
/* ── Screen navigation ── */
function navigate(to, from) {
    const fromEl = document.getElementById(from || currentScreen);
    const toEl = document.getElementById(to);
    if (!toEl || fromEl === toEl) return;

    // Slide current screen out to the left
    fromEl.classList.add('exit-left');
    setTimeout(() => {
        fromEl.classList.remove('active', 'exit-left');
    }, 280);

    // Slide next screen in from the right
    toEl.style.transform = 'translateX(40px)';
    toEl.classList.add('active');
    setTimeout(() => {
        toEl.style.transform = '';
    }, 10);

    currentScreen = to;
}

function toggleFolder(header) {
    const item = header.closest('.folder-item');
    item.classList.toggle('expanded');
}

/* ── Lightbox ── */
function openLightbox(id, type) {
    console.log(id);
    const imgs =['jpg','heic','gif', 'png','webp'];
    if(imgs.includes(type)) {
        document.getElementById('lightbox-image').src = ""
        document.getElementById('lightbox-image').src = `https://lh3.googleusercontent.com/d/${id}=w800`
        document.getElementById('lightbox').classList.add('open');
    } else {
        const url = `https://drive.google.com/file/d/${id}/view`;
        window.open(url, "_blank") || (window.location.href = url);
    }

}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.getElementById('lightbox-image').src = ""
}
