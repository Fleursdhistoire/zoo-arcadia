export async function sendEmail(to: string, subject: string, body: string) {
  console.log(`Sending email to ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Email sent successfully');
      resolve(true);
    }, 1000);
  });
}