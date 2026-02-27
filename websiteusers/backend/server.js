const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de multer para subir archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Base de datos en memoria (puedes cambiar a MongoDB, PostgreSQL, etc.)
let personas = [];
let lideres = [];

// Endpoint para cargar Excel
app.post('/api/upload-excel', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha enviado ningún archivo' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Validar y procesar datos
    const nuevasPersonas = [];
    const duplicados = [];
    const errores = [];

    data.forEach((row, index) => {
      const persona = {
        id: Date.now() + index,
        nombre: row['NOMBRE Y APELLIDOS'] || row.nombre || '',
        cedula: row['Cedula'] || row.cedula || '',
        lugarVotacion: row['LUGAR DE VOTACION'] || row.lugarVotacion || '',
        direccionVotacion: row['DIRECCION L VOTACION'] || row.direccionVotacion || '',
        mesa: row['MESA'] || row.mesa || '',
        direccion: row['DIRECCION'] || row.direccion || '',
        correo: row['Correo'] || row.correo || '',
        celular: row['Celular'] || row.celular || ''
      };

      // Validar duplicados por cédula
      const existeDuplicado = personas.find(p => p.cedula === persona.cedula) || 
                              nuevasPersonas.find(p => p.cedula === persona.cedula);
      
      if (existeDuplicado) {
        duplicados.push({ fila: index + 2, persona });
      } else if (persona.cedula && persona.nombre) {
        nuevasPersonas.push(persona);
      } else {
        errores.push({ fila: index + 2, mensaje: 'Datos incompletos' });
      }
    });

    // Agregar personas válidas
    personas = [...personas, ...nuevasPersonas];

    res.json({
      success: true,
      mensaje: 'Archivo procesado correctamente',
      estadisticas: {
        totalProcesadas: data.length,
        agregadas: nuevasPersonas.length,
        duplicados: duplicados.length,
        errores: errores.length
      },
      duplicados,
      errores,
      personas: nuevasPersonas
    });

  } catch (error) {
    console.error('Error procesando archivo:', error);
    res.status(500).json({ error: 'Error procesando el archivo Excel' });
  }
});

// Obtener todas las personas
app.get('/api/personas', (req, res) => {
  res.json(personas);
});

// Obtener estadísticas
app.get('/api/estadisticas', (req, res) => {
  const stats = {
    totalPersonas: personas.length,
    totalLideres: lideres.length,
    porMesa: {},
    porLugarVotacion: {}
  };

  personas.forEach(p => {
    // Contar por mesa
    if (p.mesa) {
      stats.porMesa[p.mesa] = (stats.porMesa[p.mesa] || 0) + 1;
    }
    // Contar por lugar de votación
    if (p.lugarVotacion) {
      stats.porLugarVotacion[p.lugarVotacion] = (stats.porLugarVotacion[p.lugarVotacion] || 0) + 1;
    }
  });

  res.json(stats);
});

// Obtener todos los líderes
app.get('/api/lideres', (req, res) => {
  res.json(lideres);
});

// Crear líder
app.post('/api/lideres', (req, res) => {
  const nuevoLider = {
    id: Date.now(),
    ...req.body,
    personasAsignadas: 0,
    fechaCreacion: new Date()
  };
  lideres.push(nuevoLider);
  res.json(nuevoLider);
});

// Actualizar líder
app.put('/api/lideres/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = lideres.findIndex(l => l.id === id);
  if (index !== -1) {
    lideres[index] = { ...lideres[index], ...req.body };
    res.json(lideres[index]);
  } else {
    res.status(404).json({ error: 'Líder no encontrado' });
  }
});

// Eliminar líder
app.delete('/api/lideres/:id', (req, res) => {
  const id = parseInt(req.params.id);
  lideres = lideres.filter(l => l.id !== id);
  res.json({ success: true });
});

// Buscar personas
app.get('/api/personas/buscar', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json(personas);
  }
  
  const resultados = personas.filter(p => 
    p.nombre.toLowerCase().includes(q.toLowerCase()) ||
    p.cedula.includes(q) ||
    (p.celular && p.celular.includes(q))
  );
  
  res.json(resultados);
});

// Limpiar base de datos
app.delete('/api/personas/limpiar', (req, res) => {
  personas = [];
  res.json({ success: true, mensaje: 'Base de datos limpiada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
