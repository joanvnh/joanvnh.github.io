/**
 * CÓDIGO PARA GOOGLE APPS SCRIPT
 * Pega este código en un proyecto de script.google.com
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var calendar = CalendarApp.getDefaultCalendar();
    
    // Configuramos la fecha y hora de inicio
    // Esperamos formato: data.date (YYYY-MM-DD) y data.time (HH:MM en 24h)
    var startDateTime = new Date(data.date + 'T' + data.time + ':00');
    
    // Por defecto, cada cita dura 2 horas (puedes ajustarlo aquí)
    var endDateTime = new Date(startDateTime.getTime() + (2 * 60 * 60 * 1000));
    
    // Creamos el evento en el calendario
    var event = calendar.createEvent(
      '💅 Cita: ' + data.service + ' - ' + data.name,
      startDateTime,
      endDateTime,
      {
        description: 'Cliente: ' + data.name + '\n' +
                     'Teléfono: ' + data.phone + '\n' +
                     'Servicio: ' + data.service + '\n' +
                     'Detalles: ' + (data.details || 'Sin detalles adicionales'),
        location: 'Dani Rizos Nail\'s'
      }
    );
    
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'success',
      'eventId': event.getId()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'error': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Ajuste de CORS para permitir peticiones desde tu web
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
