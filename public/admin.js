let token = '';
const tokenGuardado = localStorage.getItem('token');
if (tokenGuardado) {
  token = tokenGuardado;
}

// =======================
// LOGIN
// =======================
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        mostrarPanelAdmin(); 
      } else {
        alert('Credenciales incorrectas');
      }
    });
}


document.addEventListener('DOMContentLoaded', () => {
  mostrarSeccion('Categorias');
});



function mostrarLogin() {
  document.getElementById('loginContainer').style.display = 'block';
  document.getElementById('adminLayout').style.display = 'none';
}



function mostrarPanelAdmin() {
  document.getElementById('loginContainer').style.display = 'none';
  document.getElementById('adminLayout').style.display = 'flex';
  
  cargarEquipos();
  cargarPartidos();
  cargarJugadores();
  cargarCategorias();
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  if (token) {
    mostrarPanelAdmin();
  } else {
    mostrarLogin(); // 👈 aquí estaba el fallo
  }
});


function mostrarSeccion(nombre) {

  document.querySelectorAll('.seccion-admin')
    .forEach(sec => sec.style.display = 'none');

  document
    .getElementById(`seccion${nombre}`).style.display = 'block';
    
  // cerrar sidebar en móvil
  const sidebar = document.getElementById('adminSidebar');
  if (window.innerWidth < 768) {
    sidebar.classList.remove('activa');
  }
}

function toggleSidebar() {
  document
    .getElementById('adminSidebar')
    .classList.toggle('activa');
}


function cargarCategorias() {
  fetch('/categorias')
    .then(res => res.json())
    .then(categorias => {
      console.log('Categorías cargadas:', categorias);

      // ===== Crear equipo =====
      const categoriaEquipo = document.getElementById('categoriaEquipo');
      if (categoriaEquipo) {
        categoriaEquipo.innerHTML = '';
        categorias.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = c.nombre;
          categoriaEquipo.appendChild(opt);
        });
      }

      // ===== Crear partido =====
      const categoriaPartido = document.getElementById('categoriaPartido');
      if (categoriaPartido) {
        categoriaPartido.innerHTML = '';
        categorias.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = c.nombre;
          categoriaPartido.appendChild(opt);
        });
      }

      // ===== Eliminar categoría =====
      const categoriaEliminar = document.getElementById('categoriaEliminar');
      if (categoriaEliminar) {
        categoriaEliminar.innerHTML = '';

        if (categorias.length === 0) {
          const opt = document.createElement('option');
          opt.textContent = 'No hay categorías';
          categoriaEliminar.appendChild(opt);
          return;
        }

        categorias.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = c.nombre;
          categoriaEliminar.appendChild(opt);
        });
      }
    })
    .catch(err => {
      console.error('Error cargando categorías:', err);
    });
}





function crearCategoria() {
  const nombre = document.getElementById('nombreCategoria').value;

  fetch('/categorias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nombre })
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje);
      alert('Categoría creada');
      cargarCategorias();
    })
    .catch(err => alert(err.message));
}

function eliminarCategoria() {
  const id = document.getElementById('categoriaEliminar').value;

  fetch(`/categorias/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje);
      alert('Categoría eliminada');
      cargarCategorias();
    })
    .catch(err => alert(err.message));
}


// =======================
// CREAR EQUIPO
// =======================

function crearEquipo() {
  const nombre = document.getElementById('nombreEquipo').value;
  const categoriaId = document.getElementById('categoriaEquipo').value;
  const logoInput = document.getElementById('logoEquipo');
  const logo = logoInput.files[0];

  if (!nombre || !categoriaId) {
    alert('Faltan datos');
    return;
  }

  const formData = new FormData();
  formData.append('nombre', nombre);
  formData.append('categoriaId', categoriaId);
  if (logo) formData.append('logo', logo);

  fetch('/equipos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })
    .then(res => res.json())
  .then(data => {
    if (data.mensaje) throw new Error(data.mensaje);
    alert('Equipo creado');
    cargarEquipos();
  })
  .catch(err => {
    console.error(err);
    alert('Error creando equipo');
  });
}



// =======================
// CREAR PARTIDO
// =======================
function crearPartido() {
  const localId = document.getElementById('equipoLocal').value;
  const visitanteId = document.getElementById('equipoVisitante').value;
  const fecha = document.getElementById('fecha').value;
  const hora = document.getElementById('hora').value;
  const jornada = document.getElementById('jornadaPartido').value;
  const categoriaId = document.getElementById('categoriaPartido').value;

  fetch('/partidos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      localId,
      visitanteId,
      fecha,
      hora,
      jornada, // ⭐ NUEVO
      categoriaId
    })
  })
  .then(res => res.json())
  .then(() => {
    alert('Partido creado correctamente');
    cargarPartidos();
  })
  .catch(() => alert('Error creando partido'));
}


function cargarEquipos() {
  fetch('/equipos')
    .then(res => res.json())
    .then(equipos => {
      mapaEquipos = {};
      equipos.forEach(e => {
        mapaEquipos[e.id] = e;
      });

      // ===== selects existentes =====
      const selectLocal = document.getElementById('equipoLocal');
      const selectVisitante = document.getElementById('equipoVisitante');
      const selectEliminarEquipo = document.getElementById('equipoEliminar');

      // ===== nuevos selects (jugadores) =====
      const selectEquipoJugador = document.getElementById('equipoJugador');
      const selectEquipoEditarJugador = document.getElementById('equipoEditarJugador');

      // limpiar todos si existend
      [
        selectLocal,
        selectVisitante,
        selectEliminarEquipo,
        selectEquipoJugador,
        selectEquipoEditarJugador
      ].forEach(s => {
        if (s) s.innerHTML = '';
      });

      equipos.forEach(e => {
        // crear partido
        if (selectLocal) {
          const opt = document.createElement('option');
          opt.value = e.id;
          opt.textContent = e.nombre;
          selectLocal.appendChild(opt);
        }

        if (selectVisitante) {
          const opt = document.createElement('option');
          opt.value = e.id;
          opt.textContent = e.nombre;
          selectVisitante.appendChild(opt);
        }

        // eliminar equipo
        if (selectEliminarEquipo) {
          const opt = document.createElement('option');
          opt.value = e.id;
          opt.textContent = e.nombre;
          selectEliminarEquipo.appendChild(opt);
        }

        // crear jugador
        if (selectEquipoJugador) {
          const opt = document.createElement('option');
          opt.value = e.id;
          opt.textContent = e.nombre;
          selectEquipoJugador.appendChild(opt);
        }

        // editar jugador
        if (selectEquipoEditarJugador) {
          const opt = document.createElement('option');
          opt.value = e.id;
          opt.textContent = e.nombre;
          selectEquipoEditarJugador.appendChild(opt);
        }
      });

      console.log('✅ Equipos cargados en TODOS los selects');
    });
}


function cargarJugadores() {
  fetch('/jugadores')
    .then(res => res.json())
    .then(jugadores => {
      const editar = document.getElementById('jugadorEditar');
      const eliminar = document.getElementById('jugadorEliminar');
      const nombreEquipo = mapaEquipos[jugadores.equipoId] || 'Sin equipo';
      

      if (editar) editar.innerHTML = '';
      if (eliminar) eliminar.innerHTML = '';

      

      jugadores.forEach(j => {
        const texto = `${j.nombre} ${j.idEquipo ? `(${mapaEquipos[j.equipoId].nombre})` : '(Sin equipo)'}`;

        if (editar) {
          const opt = document.createElement('option');
          opt.value = j.id;
          opt.textContent = texto;
          editar.appendChild(opt);
        }

        if (eliminar) {
          const opt = document.createElement('option');
          opt.value = j.id;
          opt.textContent = texto;
          eliminar.appendChild(opt);
        }
      });
    });
}



function eliminarEquipo() {
  const id = document.getElementById('equipoEliminar').value;

  console.log('Intentando eliminar equipo ID:', id);

  if (!id) {
    alert('No hay equipo seleccionado');
    return;
  }

  if (!confirm('¿Seguro que deseas eliminar este equipo?')) return;

  fetch(`/equipos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(async res => {
      console.log('Status:', res.status);

      const data = await res.json();
      console.log('Respuesta backend:', data);

      if (!res.ok) {
        throw new Error(data.mensaje || 'Error eliminando equipo');
      }

      alert('Equipo eliminado');
      cargarEquipos();
    })
    .catch(err => {
      console.error('Error eliminarEquipo:', err);
      alert(err.message);
    });
}


function eliminarPartido() {
  const id = document.getElementById('partidoEliminar').value;

  if (!confirm('¿Seguro que deseas eliminar este partido?')) return;

  fetch(`/partidos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'// 🔥 OBLIGATORIO
    }
  })
    .then(async res => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'Error eliminando partido');
      }

      alert('Partido eliminado');
      cargarPartidos();
    })
    .catch(err => alert(err.message));
}


function crearJugador() {
  const nombre = document.getElementById('nombreJugador').value;
  const equipoId = document.getElementById('equipoJugador').value;

  fetch('/jugadores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nombre, equipoId })
  })
    .then(res => res.json())
    .then(() => {
      alert('Jugador creado');
      cargarJugadores();
    });
}

function editarJugador() {
  const jugadorId = document.getElementById('jugadorEditar').value;
  const equipoId = document.getElementById('equipoEditarJugador').value;

  fetch(`/jugadores/${jugadorId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ equipoId })
  })
    .then(res => res.json())
    .then(() => {
      alert('Jugador actualizado');
      cargarJugadores();
    });
}

function eliminarJugador() {
  const id = document.getElementById('jugadorEliminar').value;

  fetch(`/jugadores/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(() => {
      alert('Jugador eliminado');
      cargarJugadores();
    });
}
let goleadores = [];

function agregarGoleador() {
  const container = document.getElementById('goleadoresContainer');

  const div = document.createElement('div');
  div.className = 'fila-goleador';

  div.innerHTML = `
    <select class="jugadorSelect"></select>
    <input type="number" class="golesInput" min="1" value="1">
  `;

  container.appendChild(div);

  cargarJugadoresEnSelect(div.querySelector('.jugadorSelect'));
}


function cargarJugadoresEnSelect(select) {
  fetch('/jugadores')
    .then(res => res.json())
    .then(jugadores => {
      select.innerHTML = '';
      jugadores.forEach(j => {
        const opt = document.createElement('option');
        opt.value = j.id;
        opt.textContent = j.nombre;
        select.appendChild(opt);
      });
    });
}

// =======================
// CARGAR PARTIDOS EN SELECT
// =======================
// =======================
// CARGAR PARTIDOS EN SELECT
// =======================
function cargarPartidos() {
  fetch('/partidos')
    .then(res => res.json())
    .then(partidos => {

      // ===== Select registrar resultado =====
      const resultadoSelect = document.getElementById('partidoId');
      if (resultadoSelect) {
        resultadoSelect.innerHTML = '';

        partidos.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id; // 🔑 SIEMPRE ID NUMÉRICO

          // 👇 mostrar ID humano
          if (p.codigo) {
            opt.textContent = p.codigo;
          } else {
            opt.textContent = `Partido ${p.id}`;
          }

          resultadoSelect.appendChild(opt);
        });
      }

      // ===== Select eliminar partido =====
      const eliminarSelect = document.getElementById('partidoEliminar');
      if (eliminarSelect) {
        eliminarSelect.innerHTML = '';

        partidos.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;

          opt.textContent = p.codigo
            ? `${p.codigo} | ${p.fecha} ${p.hora || ''}`
            : `Partido ${p.id} | ${p.fecha} ${p.hora || ''}`;

          eliminarSelect.appendChild(opt);
        });
      }

      // ===== Select editar partido =====
      const editarSelect = document.getElementById('partidoEditar');
      if (editarSelect) {
        editarSelect.innerHTML = '';

        partidos.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;

          opt.textContent = p.codigo
            ? `${p.codigo} | ${p.fecha} ${p.hora || ''}`
            : `Partido ${p.id} | ${p.fecha} ${p.hora || ''}`;

          editarSelect.appendChild(opt);
        });
      }
    })
    .catch(err => {
      console.error('Error cargando partidos:', err);
    });
}




// =======================
// REGISTRAR RESULTADO
// =======================
function registrarResultado() {
  const partidoId = document.getElementById('partidoId').value;
  const golesLocal = document.getElementById('golesLocal').value;
  const golesVisitante = document.getElementById('golesVisitante').value;

  if (!partidoId) {
    alert('Selecciona un partido');
    return;
  }

  const goleadores = [];

  document.querySelectorAll('#goleadoresContainer .fila-goleador').forEach(fila => {
    const jugadorSelect = fila.querySelector('.jugadorSelect');
    const golesInput = fila.querySelector('.golesInput');

    if (jugadorSelect.value && golesInput.value > 0) {
      goleadores.push({
        jugadorId: Number(jugadorSelect.value),
        goles: Number(golesInput.value)
      });
    }
  });

  console.log('📤 ENVIANDO GOLEADORES:', goleadores);

  fetch(`/partidos/${partidoId}/resultado`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      golesLocal,
      golesVisitante,
      goleadores
    })
  })
    .then(res => res.json())
    .then(data => {
      alert('Resultado registrado');
      document.getElementById('goleadoresContainer').innerHTML = '';
      cargarPartidos();

    })
    .catch(err => {
      console.error(err);
      alert('Error registrando resultado');
    });
}





function logout() {
  localStorage.removeItem('token');
  token = '';
  alert('Sesión cerrada');
  location.reload();
}

function editarPartido() {
  const id = document.getElementById('partidoEditar').value;
  const fecha = document.getElementById('editarFecha').value;
  const hora = document.getElementById('editarHora').value;

  if (!fecha && !hora) {
    alert('Debes cambiar fecha o hora');
    return;
  }

  fetch(`/partidos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ fecha, hora })
  })
    .then(async res => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'Error editando partido');
      }

      alert('Partido actualizado');
      cargarPartidos();
    })
    .catch(err => alert(err.message));
}



window.onload = () => {
  if (token) {
    cargarEquipos();
    cargarJugadores();
    cargarPartidos();
    cargarCategorias();
  }
};
