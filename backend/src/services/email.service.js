import nodemailer from 'nodemailer';
const configEnv = () => process.env;

// Configurar el transportador de correo (se requiere EMAIL_USER y EMAIL_PASS en .env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: configEnv().EMAIL_USER,
    pass: configEnv().EMAIL_PASS,
  },
});

export const enviarCorreoAceptacion = async (emailDestino, rut) => {
  try {
    if (!configEnv().EMAIL_USER || !configEnv().EMAIL_PASS) {
      console.warn('[Email Mock - Aceptación] Falta configurar EMAIL_USER y EMAIL_PASS en .env');
      console.log(`[Email Mock] Hola, tu inscripción ha sido aceptada. Correo: ${emailDestino}, Clave: ${rut}`);
      return;
    }

    const mailOptions = {
      from: `"Escuela de Conducción" <${configEnv().EMAIL_USER}>`,
      to: emailDestino,
      subject: '¡Felicidades! Tu solicitud de inscripción ha sido ACEPTADA 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #059669; padding: 20px; text-align: center; color: white;">
            <h2>¡Bienvenido a la Escuela de Conducción!</h2>
          </div>
          <div style="padding: 20px; color: #333;">
            <p>Hola,</p>
            <p>Nos complace informarte que hemos validado tu comprobante de pago y tu preinscripción ha sido <strong>aprobada exitosamente</strong>.</p>
            <p>Ya puedes iniciar sesión en nuestro portal de alumnos con las siguientes credenciales temporales:</p>
            <ul style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; list-style-type: none;">
              <li><strong>Correo electrónico:</strong> ${emailDestino}</li>
              <li><strong>Contraseña temporal:</strong> ${rut}</li>
            </ul>
            <p>Te recomendamos cambiar esta contraseña una vez que ingreses al sistema.</p>
            <br/>
            <p>Atentamente,<br/><strong>El equipo de Secretaría</strong></p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email Enviado - Aceptación]', info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo de aceptación:', error);
  }
};

export const enviarCorreoRechazo = async (emailDestino, motivo) => {
  try {
    if (!configEnv().EMAIL_USER || !configEnv().EMAIL_PASS) {
      console.warn('[Email Mock - Rechazo] Falta configurar EMAIL_USER y EMAIL_PASS en .env');
      console.log(`[Email Mock] Hola, tu inscripción fue rechazada. Motivo: ${motivo}`);
      return;
    }

    const mailOptions = {
      from: `"Escuela de Conducción" <${configEnv().EMAIL_USER}>`,
      to: emailDestino,
      subject: 'Aviso sobre tu solicitud de inscripción ⚠️',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #dc2626; padding: 20px; text-align: center; color: white;">
            <h2>Actualización de tu solicitud</h2>
          </div>
          <div style="padding: 20px; color: #333;">
            <p>Hola,</p>
            <p>Hemos revisado tu solicitud de preinscripción. Lamentablemente, ha sido <strong>rechazada</strong> en esta ocasión por el siguiente motivo:</p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0;">
              <strong>Motivo:</strong> ${motivo}
            </div>
            <p>Si crees que se trata de un error, o deseas volver a intentarlo adjuntando la documentación correcta, te invitamos a llenar el formulario nuevamente en nuestra plataforma.</p>
            <br/>
            <p>Atentamente,<br/><strong>El equipo de Secretaría</strong></p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email Enviado - Rechazo]', info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo de rechazo:', error);
  }
};

export const enviarAlertaMantenimiento = async (patente, reporteFalla, kilometraje, emailDestino) => {
  try {
    if (!configEnv().EMAIL_USER || !configEnv().EMAIL_PASS) {
      console.warn('[Email Mock - Alerta Mantenimiento] Falta configurar EMAIL_USER y EMAIL_PASS en .env');
      console.log(`[Email Mock] Alerta Mantenimiento: Vehículo ${patente} en mantenimiento por falla grave.`);
      return;
    }

    const mailOptions = {
      from: `"Sistema de Flota" <${configEnv().EMAIL_USER}>`,
      to: emailDestino || configEnv().EMAIL_USER,
      subject: `🚨 ALERTA CRÍTICA: Vehículo ${patente} En Mantenimiento`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #dc2626; padding: 20px; text-align: center; color: white;">
            <h2>Alerta de Falla Grave en Vehículo</h2>
          </div>
          <div style="padding: 20px; color: #333;">
            <p>Hola Administrador,</p>
            <p>Se ha reportado una falla mecánica de gravedad <strong>Alta</strong>. El vehículo ha sido puesto automáticamente <strong>En Mantenimiento</strong> y no podrá ser asignado a futuras clases.</p>
            <ul style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 5px; list-style-type: none;">
              <li><strong>Patente:</strong> ${patente}</li>
              <li><strong>Kilometraje Reportado:</strong> ${kilometraje} km</li>
              <li><strong>Reporte de Falla:</strong> ${reporteFalla.descripcion || reporteFalla.detalle || 'Sin descripción detallada'}</li>
            </ul>
            <p>Por favor, gestione su pronta reparación.</p>
            <br/>
            <p>Atentamente,<br/><strong>El equipo de Mantenimiento</strong></p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email Enviado - Alerta Mantenimiento]', info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo de alerta de mantenimiento:', error);
  }
};
