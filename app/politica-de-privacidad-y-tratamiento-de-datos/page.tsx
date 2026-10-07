import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de privacidad y tratamiento de datos — DEEPSCAN',
  description: 'Política de privacidad y tratamiento de datos personales de DEEPSCAN SAS, conforme a la Ley 1581 de 2012.',
  alternates: { canonical: '/politica-de-privacidad-y-tratamiento-de-datos/' },
};

export default function Politica() {
  return (
    <main className="legal-page">
      <div className="legal-wrap">
        <a className="legal-logo" href="/" aria-label="DEEPSCAN inicio">
          <img src="/assets/deepscan-logo.png" alt="DEEPSCAN" />
        </a>
        <span className="legal-eyebrow">Legal</span>
        <h1>Política de privacidad y tratamiento de datos</h1>
        <article>
          <p>{"En cumplimiento de lo dispuesto por la Ley 1581 de 2012 y el Decreto 1377 de 2013 de la República de Colombia, DEEPSCAN SAS, con domicilio en Colombia, emite la presente Política de Privacidad y Tratamiento de Datos Personales, la cual tiene como fin garantizar la protección y el manejo adecuado de la información personal recolectada de sus usuarios, clientes y empleados."}</p>
          <h2>{"1. Finalidad del Tratamiento de Datos Personales"}</h2>
          <p>{"Los datos personales suministrados a DEEPSCAN SAS serán utilizados con las siguientes finalidades:"}</p>
          <ul>
          <li>{"Prestación de los servicios de marketing digital ofrecidos por la empresa."}</li>
          <li>{"Envío de información comercial, promocional o publicitaria relacionada con los productos y servicios de DEEPSCAN SAS."}</li>
          <li>{"Realización de estudios de mercado, análisis estadísticos y encuestas de satisfacción para mejorar nuestros servicios."}</li>
          <li>{"Gestión de solicitudes, quejas o reclamos presentados por los usuarios."}</li>
          <li>{"Cumplimiento de obligaciones legales y contractuales."}</li>
          </ul>
          <h2>{"2. Datos Recopilados"}</h2>
          <p>{"DEEPSCAN SAS puede recolectar datos personales tales como:"}</p>
          <ul>
          <li>{"Nombre completo"}</li>
          <li>{"Correo electrónico"}</li>
          <li>{"Número de contacto"}</li>
          <li>{"Información financiera (cuando sea aplicable)"}</li>
          <li>{"Dirección IP y otros datos relacionados con la navegación en nuestro sitio web."}</li>
          </ul>
          <h2>{"3. Alcance y Tratamiento de la Información"}</h2>
          <p>{"El tratamiento de los datos personales se realizará conforme a los principios de legalidad, finalidad, libertad, veracidad, transparencia, acceso y circulación restringida, seguridad y confidencialidad. DEEPSCAN SAS garantiza que los datos no serán vendidos, cedidos o compartidos con terceros, salvo que sea necesario para cumplir con una obligación legal o contractual."}</p>
          <h2>{"4. Derechos de los Titulares de los Datos"}</h2>
          <p>{"Los titulares de los datos personales tienen derecho a:"}</p>
          <ul>
          <li>{"Conocer, actualizar y rectificar sus datos personales frente a DEEPSCAN SAS."}</li>
          <li>{"Solicitar prueba de la autorización otorgada para el tratamiento de sus datos personales."}</li>
          <li>{"Ser informados sobre el uso que se ha dado a sus datos personales."}</li>
          <li>{"Presentar quejas ante la Superintendencia de Industria y Comercio por el uso indebido de sus datos personales."}</li>
          <li>{"Revocar la autorización o solicitar la supresión del dato cuando se considere que no se respetan los principios y derechos constitucionales y legales."}</li>
          </ul>
          <h2>{"5. Mecanismos para el Ejercicio de los Derechos"}</h2>
          <p>{"Para ejercer sus derechos, el titular podrá enviar una solicitud al correo electrónico de contacto info@deepscan.com.co, indicando claramente el derecho que desea ejercer. DEEPSCAN SAS responderá dicha solicitud en los términos legales establecidos."}</p>
          <h2>{"6. Seguridad de la Información"}</h2>
          <p>{"DEEPSCAN SAS ha implementado las medidas técnicas, humanas y administrativas necesarias para garantizar la seguridad de los datos personales y evitar su adulteración, pérdida, consulta, uso o acceso no autorizado."}</p>
          <h2>{"7. Vigencia y Modificación de la Política de Privacidad"}</h2>
          <p>{"DEEPSCAN SAS se reserva el derecho de modificar esta política en cualquier momento, siempre cumpliendo con las disposiciones legales vigentes. Las modificaciones serán publicadas oportunamente en nuestro sitio web."}</p>
          <p>{"Fecha de entrada en vigor: 16/09/2024."}</p>
          <p>{"Si tienes alguna duda o consulta sobre nuestra Política de Privacidad, puedes contactarnos a través del correo electrónico info@deepscan.co."}</p>
        </article>
        <a className="legal-back" href="/">← Volver al inicio</a>
      </div>
    </main>
  );
}
