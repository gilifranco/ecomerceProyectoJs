const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const comprar = document.getElementById('comprar');
const cantidad = document.getElementById('cantidadProductos');
const templateCard = document.getElementById('template-card').content;
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
const templateCompra = document.getElementById('template-compra').content;
const fragment = document.createDocumentFragment();
let carrito = {};

document.addEventListener('DOMContentLoaded', e => {
    fetchData();
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }
})

cards.addEventListener('click', e => {
    addCarrito(e);
})

items.addEventListener('click', e => {
    btnAccion(e);
})


// Traer productos:
const fetchData = async () => {
    try {
        const res = await fetch('./JSON/api.json')
        const data = await res.json()

        pintarCards(data);
        // Filtrado
        const formulario = document.querySelector('#formulario');
        const boton = document.querySelector('#boton');
        const refresh = document.querySelector('#refresh')

        const filtro = () => {
            cards.innerHTML = '';
            const consulta = formulario.value.toLowerCase();
            const filtrado = data.filter(p => p.tipo.toLowerCase() === consulta);
            pintarCards(filtrado);
        }
        
        boton.addEventListener('click', filtro)
        refresh.addEventListener('click', e => {
            cards.innerHTML = '';
            pintarCards(data);
        })


    } catch (error) {
        console.log(error)
    }
}


// Pintar productos:
const pintarCards = data => {
    data.forEach(item => {
        templateCard.querySelector('h5').textContent = item.nombre;
        templateCard.querySelector('.precio').textContent = item.precio;
        templateCard.querySelector('img').setAttribute('src', item.imagen);
        templateCard.querySelector('.btn').dataset.id = item.id;

        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone);
    });
    cards.appendChild(fragment)
}



// Agregar al carrito:
const addCarrito = e => {
    if (e.target.classList.contains('btn-dark')) {
        setCarrito(e.target.parentElement);
    }

    e.stopPropagation()
}

const setCarrito = item => {
    const producto = {
        id: item.querySelector('.btn-dark').dataset.id,
        nombre: item.querySelector('h5').textContent,
        precio: item.querySelector('.precio').textContent,
        cantidad: 1,
    }

    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }

    carrito[producto.id] = {
        ...producto
    }

    pintarCarrito();
}

const pintarCarrito = () => {
    items.innerHTML = ''

    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.nombre;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('.precio').textContent = producto.precio * producto.cantidad;

        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    })
    items.appendChild(fragment)
    pintarFooter();
    pintarBtnCompra();
    cantidadProductos();

    localStorage.setItem('carrito', JSON.stringify(carrito))
}

const pintarFooter = () => {
    footer.innerHTML = '';
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `
        <th scope="row" colspan="5" class="ps-5">Seleccione productos</th>
        `

        return
    }

    const nCantidad = Object.values(carrito).reduce((acc, {
        cantidad
    }) => acc + cantidad, 0);
    const nPrecio = Object.values(carrito).reduce((acc, {
        cantidad,
        precio
    }) => acc + cantidad * precio, 0);
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent = nPrecio;

    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);

    const btnVaciar = document.getElementById('vaciar-carrito')
    btnVaciar.addEventListener('click', () => {
        carrito = {};
        pintarCarrito();
    })
}

// ACCION DE COMPRAR
const pintarBtnCompra = () => {
    comprar.innerHTML = '';
    if (Object.keys(carrito).length === 0) {
        comprar.innerHTML = `<p class="col-12 pe-5">Usted tiene ${Object.keys(carrito).length} preoductos seleccionados</p>`
        return
    }
    templateCompra.querySelector('.btn-success')

    const clone = templateCompra.cloneNode(true);
    fragment.appendChild(clone);
    comprar.appendChild(fragment);

    const nPrecio = Object.values(carrito).reduce((acc, {
        cantidad,
        precio
    }) => acc + cantidad * precio, 0);

    const btnComprar = document.getElementById('comprar-carrito')
    btnComprar.addEventListener('click', () => {
        Swal.fire({
            title: '¿Continuar el pago?',
            text: "Su total es $" + nPrecio,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Pagar'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Pago exitoso!',
                    text: "Gracias por su confianza :)",
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                })
                carrito = {};
                pintarCarrito();
            }
        })
    })
}

// Mostrar cantidad de productos en Navbar
const cantidadProductos = () => {
    cantidad.innerHTML = '';
    const nCantidad = Object.values(carrito).reduce((acc, {
        cantidad
    }) => acc + cantidad, 0);
    cantidad.innerHTML = `(${nCantidad})`
}




const btnAccion = e => {
    // AUMENTAR PRODUCTO
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad++;
        carrito[e.target.dataset.id] = {
            ...producto
        }
        pintarCarrito()
    }

    // DISMINUIR PRODUCTO
    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad--;
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        }
        pintarCarrito()
    }
    e.stopPropagation();
}