//console.log('hi');
const result = document.getElementById('result');
const form = document.getElementById('update_banner_image');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    let load = JSON.stringify({
        "banner_image": form.banner_image.value,
        "key": form.key.value
    });
    fetch('/update', {
        method: 'POST',
        headers: new Headers({ "Content-Type": "application/json" }),
        body: load
    }).then(r => {
        r.text().then(t => {
            console.log(t);
            result.innerText = t;
        });
    }).catch(e => {
        console.log(e);
        result.innerText = e;
        result.style.color = 'red';
    });
});
const hot_reload_img = document.getElementById('hot_load');
form.banner_image.addEventListener('input', (e) => {
    hot_reload_img.src = form.banner_image.value;
});