import OptionsDropdown from '../components/OptionsDropdown';

export default function Home() {
  return (
    <>
      <main className='p-2 flex flex-col items-center justify-center bg-gradient-to-b from-purple-400 to-white'>
        <h1 className='text-6xl text-white font-bold'>Palga Oraakel Paavo Prognoosid®</h1>
        <q className='text-2xl text-white font-bold my-4'>Kes ei küsi Paavolt, jääb palgast ilma.</q>
        <video
          src="/oracle.mp4"
          width={600}
          autoPlay
          muted
          loop
          playsInline
          className="rounded-b-full border-8 border-purple-900"
        >
        </video>
        <OptionsDropdown />
      </main>
    </>
  );
};