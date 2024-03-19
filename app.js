// Configurar proyecto de Firebase
const firebaseConfig = {
    storageBucket: "tinta-a5ec6.appspot.com", // URL de tu Firebase Storage 
};

// Iniciar Firebase
firebase.initializeApp(firebaseConfig);


//optener referencia almacenamiento de Firebase
const storage = firebase.storage();
const storageFirebase = storage.ref();

//evento click del boton del html 
document.getElementById('descargar-carpeta').addEventListener('click', function() {
    descargarCarpetaComoZIP();
});

function descargarCarpetaComoZIP() {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // agregar para poder descargar, ya que si no no te deja la politica de CORS de firebase

    //objeto JSZip para crear un archivo ZIP donde se almacenan las fotos de la carpeta de firebase 
    const zip = new JSZip();

    // Obtener nombre de a carpeta de Firebase
    const imagenesFirebase = storageFirebase.child('imagenes');

    // Listar todos los archivos en la carpeta
    imagenesFirebase.listAll().then(function(result) {
        // almacena todos los archivos de la carpeta en una variable
        const promesasDescarga = [];

        result.items.forEach(function(item) {
            // Obtener el nombre de las imagenes 
            const nombre = item.name;
            // Obtener el enlace de descarga de cada archivo
            const promesa = item.getDownloadURL().then(function(url) {
                // Fetch del archivo a través del proxy CORS
                return fetch(proxyUrl + url).then(function(response) {
                    return response.blob();
                }).then(function(blob) {
                    // Agregar el blob al ZIP con el nombre del archivo
                    zip.file(nombre, blob);
                });
            }).catch(function(error) {
                console.error('Error al obtener el enlace de descarga para:', nombre, error);
            });

            // Agregar la promesa al arreglo
            promesasDescarga.push(promesa);
        });
       // Esperar a que todas las promesas de descarga se completen
       Promise.all(promesasDescarga).then(function() {
        // Generar el archivo ZIP una vez que se hayan descargado todos los archivos
        zip.generateAsync({type:"blob"}).then(function(content) {
            // Crear un enlace <a> para descargar el archivo ZIP
            const a = document.createElement('a');
            a.href = URL.createObjectURL(content);
            a.download = 'imagenes.zip'; // Nombre del archivo ZIP
            a.click(); // Simular un clic en el enlace para iniciar la descarga
        });
    });
}).catch(function(error) {
    console.error('Error al listar archivos en la carpeta:', error);
});
}
