import Image from 'next/image';

export default function MarcaSeguridad({ compacta = false }: { compacta?: boolean }) {
  return <Image src="/marca/entre-claves.png" alt="Entre Claves" width={2172} height={724}
    priority={!compacta} className={compacta ? 'marca-entre-claves marca-compacta' : 'marca-entre-claves'} />;
}
