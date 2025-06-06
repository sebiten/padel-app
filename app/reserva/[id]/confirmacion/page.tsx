import { NextPage } from "next";

interface Props {}

const Page: NextPage<Props> = ({}) => {
  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">¡Reserva Confirmada!</h1>
          <p className="text-muted-foreground">
            Tu reserva ha sido confirmada exitosamente.
          </p>
          <p className="text-lg">
            Gracias por elegirnos. ¡Nos vemos en la cancha!
          </p>
        </div>
      </div>
    </div>
  );
};
export default Page;