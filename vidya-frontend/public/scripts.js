let btn1 = () => {
    console.log('here')
    let e = document.querySelector('#btn_chosen')
    
    if (e.style.color === 'red') {
        e.style.color = '#FFA366';
        console.log(e.style.color)
    } else {
        e.style.color = 'red';
    }
}