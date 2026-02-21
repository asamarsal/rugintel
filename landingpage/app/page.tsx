import { AnimatedGradient } from '@/components/animated-gradient';
import { Navbar } from '@/components/sections/navbar';
import { Hero } from '@/components/sections/hero';
import { Problem } from '@/components/sections/problem';
import { Solution } from '@/components/sections/solution';
import { RugpullChart } from '@/components/rugpull-chart';
import { Comparison } from '@/components/sections/comparison';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Miners } from '@/components/sections/miners';
import { Ticker } from '@/components/sections/ticker';
import { FAQ } from '@/components/sections/faq';
import { Footer } from '@/components/sections/footer';

export default function Home() {
  return (
    <>
      <AnimatedGradient />
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <RugpullChart />
        <Comparison />
        <HowItWorks />
        <Miners />
        <Ticker />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
