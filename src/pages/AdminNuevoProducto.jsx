import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import AdminMenu from '../components/AdminMenu';
import CampoFormulario from '../components/CampoFormulario';
import { cargarProductos, guardarProducto } from '../utils/catalogo';
import { categorias } from '../utils/categorias';
import { validarOferta } from '../utils/precios';
const inicial = {
  codigo: '',
  nombre: '',
  descripcion: '',
  precio: '',
  precioOferta: '',
  stock: '',
  stockCritico: '',
  categoria: 'otros',
  imagen: '',
  alt: ''
};
/** Alta y edición de un producto; la URL id selecciona el registro a modificar. */
export default function AdminNuevoProducto() {
  const [params] = useSearchParams();
  const id = Number(params.get('id')) || undefined;
  const [datos, setDatos] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [listo, setListo] = useState(!id);
  const navigate = useNavigate();
  useEffect(() => {
    if (!id) return;
    cargarProductos().then(lista => {
      const p = lista.find(p => p.id === id);
      if (!p) throw Error();
      setDatos(p);
      setListo(true);
    }).catch(() => setErrores({
      general: 'Producto no encontrado.'
    }));
  }, [id]);
  const cambiar = e => setDatos({
    ...datos,
    [e.target.name]: e.target.value
  });
  const enviar = async e => {
    e.preventDefault();
    const errores = {};
    const errorOferta = validarOferta(datos.precio, datos.precioOferta);
    if (errorOferta) errores.precioOferta = errorOferta;
    if (!categorias.includes(datos.categoria)) errores.categoria = 'Selecciona una categoría válida.';
    if (datos.codigo.trim().length < 3) errores.codigo = 'Ingresa un código de al menos tres caracteres.';
    if (!datos.nombre.trim() || datos.nombre.length > 100) errores.nombre = 'Ingresa un nombre de hasta 100 caracteres.';
    if (!datos.descripcion.trim() || datos.descripcion.length > 500) errores.descripcion = 'Ingresa una descripción de hasta 500 caracteres.';
    if (datos.precio === '' || !Number.isFinite(Number(datos.precio)) || Number(datos.precio) < 0) errores.precio = 'Ingresa un precio válido.';
    if (datos.stock === '' || !Number.isInteger(Number(datos.stock)) || Number(datos.stock) < 0) errores.stock = 'Ingresa un stock entero de cero o más.';
    if (datos.stockCritico && (!Number.isInteger(Number(datos.stockCritico)) || Number(datos.stockCritico) < 0)) errores.stockCritico = 'El stock crítico debe ser un entero de cero o más.';
    if (datos.imagen && !/^(https?:\/\/|\.?\/)/.test(datos.imagen)) errores.imagen = 'Usa una dirección http o https, o una imagen local.';
    setErrores(errores);
    if (Object.keys(errores).length) return;
    try {
      await guardarProducto({
        ...datos,
        codigo: datos.codigo.trim(),
        nombre: datos.nombre.trim(),
        precio: Number(datos.precio),
        precioOferta: datos.precioOferta === '' || datos.precioOferta == null ? null : Number(datos.precioOferta),
        stock: Number(datos.stock),
        imagen: datos.imagen || `${import.meta.env.BASE_URL}img/catalogo.svg`,
        alt: datos.alt || datos.nombre
      }, id);
      if (datos.stockCritico !== undefined && datos.stockCritico !== '' && Number(datos.stock) <= Number(datos.stockCritico)) window.alert('Producto guardado con stock igual o inferior al stock crítico.');
      navigate('/admin-productos');
    } catch (error) {
      setErrores({
        general: error.message
      });
    }
  };
  return <><AdminMenu /><section className="mx-auto" style={{
      maxWidth: 720
    }}><h1>{id ? 'Editar producto' : 'Nuevo producto'}</h1>
  {errores.general && <p role="alert">{errores.general}</p>}
  {listo && <Form noValidate onSubmit={enviar}>
   {[['codigo', 'Código'], ['nombre', 'Nombre'], ['descripcion', 'Descripción'], ['precio', 'Precio', 'number'], ['stock', 'Stock', 'number'], ['imagen', 'URL de imagen', 'url'], ['alt', 'Descripción de la imagen']].map(([id, etiqueta, tipo]) => <CampoFormulario key={id} id={id} etiqueta={etiqueta} tipo={tipo} valor={datos[id]} onChange={cambiar} error={errores[id]} />)}
   <CampoFormulario id="precioOferta" etiqueta="Precio de oferta (opcional)" tipo="number" valor={datos.precioOferta ?? ''} onChange={cambiar} error={errores.precioOferta} />
   <p>Precio corresponde al precio normal. Deja la oferta vacía para retirarla; debe ser positiva y menor al precio normal. Valores de demostración.</p>
   <Form.Group controlId="categoria" className="mb-3"><Form.Label>Categoría</Form.Label><Form.Select name="categoria" value={datos.categoria} onChange={cambiar} isInvalid={!!errores.categoria} aria-describedby="categoria-error">{categorias.map(c => <option key={c}>{c}</option>)}</Form.Select><Form.Control.Feedback id="categoria-error" type="invalid" role="alert">{errores.categoria}</Form.Control.Feedback></Form.Group>
   <CampoFormulario id="stockCritico" etiqueta="Stock crítico (opcional)" tipo="number" valor={datos.stockCritico ?? ''} onChange={cambiar} error={errores.stockCritico} />
   <Button type="submit">Guardar producto</Button> <Button as={Link} to="/admin-productos" variant="outline-secondary">Cancelar</Button>
  </Form>}</section></>;
}
