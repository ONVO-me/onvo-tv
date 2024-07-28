function replacewithname(img) {
    img.classList.add('hidden')
    document.querySelector('.logo-v2-container').insertAdjacentHTML('beforeend', `<span>${document.querySelector('.movie-tagline span').innerText}</span>`)
  }
  function loadBack() {
    document.querySelector('.container-loading').style.opacity = 0;
  }