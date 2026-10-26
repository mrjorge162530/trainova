/* ============================================================
   DATOS DE LA PÁGINA — edita aquí sin tocar el resto del código
   ============================================================ */
(function () {
  "use strict";
  window.__BRAND__ = {
    nombre: "Trainova",

    // Enlace de pago de Hotmart (pega aquí tu link de checkout)
    checkout: "https://pay.hotmart.com/F108201233V",

    // Precio que se muestra en la página
    precio: "17",
    precioAntes: "47",
    moneda: "USD",

    // Cuenta regresiva de la oferta (47 → 17).
    // Cada visitante tiene su propio reloj: empieza en su primera visita y dura estas horas.
    // Si vuelve después de que termine, empieza un nuevo ciclo (el precio en Hotmart sigue en 17).
    ofertaHoras: 48,

    // Opcional: pon una fecha para usar un reloj fijo, igual para todos (formato AAAA-MM-DDTHH:MM:SSZ, hora UTC).
    // Si la dejas vacía, se usa el reloj por visitante de arriba.
    ofertaFin: "",

    // Contacto de soporte (opcional; deja vacío para ocultar)
    soporteWhatsapp: "",      // ej.: "5215512345678"
    soporteEmail: ""          // ej.: "soporte@tumarca.com"
  };
})();
