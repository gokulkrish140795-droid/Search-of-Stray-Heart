import React, { useState, useEffect } from 'react';
import { DeviceFrame } from './components/DeviceFrame';
import { CaptionRail } from './components/CaptionRail';
import { ScreenGateway } from './components/ScreenGateway';
import { ScreenPrank } from './components/ScreenPrank';
import { ScreenHuntStep } from './components/ScreenHuntStep';
import { ScreenVault } from './components/ScreenVault';
import { ScreenFinale } from './components/ScreenFinale';
import { RehearsalModal } from './components/RehearsalModal';
import { ScrapbookModal } from './components/ScrapbookModal';
import { HUNT_CARDS, HUNT_VAULTS, CardItem, CHAPTER_CONFIG } from './data/huntData';
import { sound } from './utils/sound';

type GameState = 'gateway' | 'prank' | 'hunt' | 'vault' | 'finale';

const getInitialStep = (): number => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    const cardParam = params.get('card');
    if (stepParam) {
      const parsed = parseInt(stepParam, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 31) return parsed;
    }
    if (cardParam) {
      const parsedCard = parseInt(cardParam, 10);
      const matched = HUNT_CARDS.find((c) => parseInt(c.id, 10) === parsedCard);
      if (matched) return matched.step;
    }
  }
  const saved = localStorage.getItem('project_ar_step');
  return saved ? parseInt(saved, 10) : 1;
};

export default function App() {
  // Check URL params on initial load (supporting ?phase=scavenger_hunt and ?step=X)
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const phase = params.get('phase');
      if (phase === 'scavenger_hunt' || phase === 'hunt') {
        return 'hunt';
      }
    }
    const saved = localStorage.getItem('project_ar_state');
    return (saved as GameState) || 'gateway';
  });

  const [currentStep, setCurrentStep] = useState<number>(getInitialStep);

  // Unique list of card IDs found - strictly cards with step < currentStep
  const [foundCardIds, setFoundCardIds] = useState<string[]>(() => {
    const initialStep = getInitialStep();
    const saved = localStorage.getItem('project_ar_found_cards');
    if (!saved) return [];
    try {
      const parsed: string[] = JSON.parse(saved);
      // Strictly only cards whose step is less than the initial step
      return parsed.filter((id) => {
        const c = HUNT_CARDS.find((card) => card.id === id);
        return c && c.step < initialStep;
      });
    } catch {
      return [];
    }
  });

  const [showRehearsal, setShowRehearsal] = useState(false);
  const [showScrapbook, setShowScrapbook] = useState(false);

  // Strict invariant: foundCardIds must never contain cards for currentStep or future steps.
  // Any stale cards from rehearsal jumps or future steps are stripped immediately.
  useEffect(() => {
    setFoundCardIds((prev) => {
      // If at a milestone vault step and missing previous cards, seed for testing
      if (currentStep === 10 || currentStep === 20 || currentStep === 30) {
        const requiredPrev = HUNT_CARDS.filter((c) => c.step < currentStep).map((c) => c.id);
        const hasMissing = requiredPrev.some((id) => !prev.includes(id));
        if (hasMissing) {
          return requiredPrev;
        }
      }

      const valid = prev.filter((id) => {
        const c = HUNT_CARDS.find((card) => card.id === id);
        return c && c.step < currentStep;
      });
      if (valid.length !== prev.length) {
        return valid;
      }
      return prev;
    });
  }, [currentStep]);

  // Derive active card or vault data early to compute chapter
  const currentCard = HUNT_CARDS.find((c) => c.step === currentStep) || HUNT_CARDS[0];
  const currentVault = HUNT_VAULTS.find((v) => v.step === currentStep) || HUNT_VAULTS[0];

  const activeChapter =
    gameState === 'hunt' && currentCard
      ? currentCard.chapter
      : gameState === 'vault' && currentVault
      ? currentVault.chapter
      : 1;

  // Compute strictly deduplicated tokens for the CURRENT active chapter from found cards
  const collectedTokens = React.useMemo(() => {
    const tokens: string[] = [];
    foundCardIds.forEach((cardId) => {
      const card = HUNT_CARDS.find((c) => c.id === cardId);
      // Only include cards belonging to the current chapter that have actually been completed (step < currentStep)
      if (card && card.chapter === activeChapter && card.step < currentStep) {
        card.letters
          .split('-')
          .map((l) => l.trim().toUpperCase())
          .filter((l) => l.length > 0)
          .forEach((letter) => tokens.push(letter));
      }
    });
    return tokens;
  }, [foundCardIds, activeChapter, currentStep]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('project_ar_state', gameState);
    localStorage.setItem('project_ar_step', currentStep.toString());
    localStorage.setItem('project_ar_found_cards', JSON.stringify(foundCardIds));
  }, [gameState, currentStep, foundCardIds]);

  // Audio BGM Director based on current game phase
  useEffect(() => {
    if (gameState === 'gateway' || gameState === 'prank') {
      sound.playBgm('bgm_intro', 0.25);
    } else if (gameState === 'hunt' || gameState === 'vault') {
      if (currentStep <= 10) {
        sound.playBgm('bgm_act1', 0.3);
      } else if (currentStep <= 20) {
        sound.playBgm('bgm_act2', 0.3);
      } else {
        sound.playBgm('bgm_act3', 0.3);
      }
    } else if (gameState === 'finale') {
      sound.playBgm('bgm_intro', 0.2);
    }
  }, [gameState, currentStep]);

  // Handlers for step progression
  const handleAcceptGateway = () => {
    setGameState('prank');
    setCurrentStep(1);
    setFoundCardIds([]);
  };

  const handlePrankUnlocked = () => {
    setGameState('hunt');
    setCurrentStep(1);
    setFoundCardIds([]);
    localStorage.removeItem('project_ar_found_cards');
    localStorage.setItem('project_ar_step', '1');
    sound.playSfx('sfx_spell_quest');
  };

  const handleCardFound = (card: CardItem) => {
    // Add unique card ID only if not already present
    setFoundCardIds((prev) => (prev.includes(card.id) ? prev : [...prev, card.id]));

    // Check if next step is a milestone vault (Steps 10, 20, 30)
    const nextStep = card.step + 1;
    if (nextStep === 10 || nextStep === 20 || nextStep === 30) {
      setCurrentStep(nextStep);
      setGameState('vault');
    } else if (nextStep > 29) {
      // Finale Protocol 0510
      setCurrentStep(31);
      setGameState('finale');
    } else {
      setCurrentStep(nextStep);
      setGameState('hunt');
    }
  };

  const handleVaultUnlocked = () => {
    const nextStep = currentStep + 1;
    if (nextStep > 30) {
      setCurrentStep(31);
      setGameState('finale');
    } else {
      setCurrentStep(nextStep);
      setGameState('hunt');
    }
  };

  const handleBackNavigation = () => {
    if (gameState === 'prank') {
      setGameState('gateway');
    } else if (gameState === 'hunt') {
      if (currentStep > 1) {
        const targetStep = currentStep - 1;
        setCurrentStep(targetStep);
        setFoundCardIds((prev) =>
          prev.filter((id) => {
            const c = HUNT_CARDS.find((card) => card.id === id);
            return c && c.step < targetStep;
          })
        );
      } else {
        setGameState('gateway');
        setFoundCardIds([]);
      }
    } else if (gameState === 'vault') {
      const targetStep = currentStep - 1;
      setCurrentStep(targetStep);
      setGameState('hunt');
      setFoundCardIds((prev) =>
        prev.filter((id) => {
          const c = HUNT_CARDS.find((card) => card.id === id);
          return c && c.step < targetStep;
        })
      );
    }
  };

  // Rehearsal quick jump
  const handleJumpToStep = (stepNumber: number) => {
    if (stepNumber === 0) {
      setGameState('gateway');
      setCurrentStep(1);
      setFoundCardIds([]);
      localStorage.removeItem('project_ar_found_cards');
      localStorage.setItem('project_ar_step', '1');
    } else if (stepNumber === 10 || stepNumber === 20 || stepNumber === 30) {
      // Seed all cards up to this vault into foundCardIds
      const prevCardIds = HUNT_CARDS.filter((c) => c.step < stepNumber).map((c) => c.id);
      setFoundCardIds(prevCardIds);
      setCurrentStep(stepNumber);
      setGameState('vault');
    } else if (stepNumber === 31) {
      const allCardIds = HUNT_CARDS.map((c) => c.id);
      setFoundCardIds(allCardIds);
      setCurrentStep(31);
      setGameState('finale');
    } else {
      // Jump to a hunt card: only cards before stepNumber are marked found
      const prevCardIds = HUNT_CARDS.filter((c) => c.step < stepNumber).map((c) => c.id);
      setFoundCardIds(prevCardIds);
      setCurrentStep(stepNumber);
      setGameState('hunt');
    }
  };

  // Derive Mini-Me's speech for the bottom CaptionRail
  let miniMeSpeech = "Aishwarya, I'm right beside you! Let's find every piece of the stray heart! ✨";
  let activeAccent = '#E8C56A';

  if (gameState === 'gateway') {
    miniMeSpeech = "Welcome to your 30th birthday quest! Tap 'I Accept' when you're ready! ❤️";
    activeAccent = '#E8C56A';
  } else if (gameState === 'prank') {
    miniMeSpeech = "Uh oh, sweetness overload! Tap my face to kiss me and wake up the system! 💋";
    activeAccent = '#FF6B8A';
  } else if (gameState === 'hunt' && currentCard) {
    miniMeSpeech = currentCard.miniMe;
    activeAccent = CHAPTER_CONFIG[currentCard.chapter].accent;
  } else if (gameState === 'vault' && currentVault) {
    miniMeSpeech = currentVault.miniMe;
    activeAccent = CHAPTER_CONFIG[currentVault.chapter].accent;
  } else if (gameState === 'finale') {
    miniMeSpeech = "Enter code 0510 to reveal the ultimate birthday surprise... 💖";
    activeAccent = '#FF6B8A';
  }

  // Full-bleed dedicated AR viewfinder during hunt phase
  if (gameState === 'hunt' && currentCard) {
    return (
      <div className="relative w-full h-[100dvh] bg-[#060B14] overflow-hidden">
        <ScreenHuntStep
          card={currentCard}
          collectedLetters={collectedTokens}
          foundCardIds={foundCardIds}
          onCardFound={handleCardFound}
          onBack={handleBackNavigation}
          onOpenRehearsal={() => setShowRehearsal(true)}
          onOpenScrapbook={() => setShowScrapbook(true)}
        />
        {showRehearsal && (
          <RehearsalModal
            currentStep={currentStep}
            onJumpToStep={handleJumpToStep}
            onClose={() => setShowRehearsal(false)}
          />
        )}
        <ScrapbookModal
          foundCardIds={foundCardIds}
          currentStep={currentStep}
          isOpen={showScrapbook}
          onClose={() => setShowScrapbook(false)}
        />
      </div>
    );
  }

  return (
    <DeviceFrame
      title={
        gameState === 'vault'
          ? `Vault Lock #${currentVault.chapter}`
          : gameState === 'finale'
          ? 'Protocol 0510'
          : 'Project AR'
      }
      subtitle={
        gameState === 'vault'
          ? 'Milestone Vault'
          : 'Aishwarya’s Birthday Quest'
      }
      showBack={gameState !== 'gateway' && gameState !== 'finale'}
      onBack={handleBackNavigation}
      accentColor={activeAccent}
      onOpenRehearsal={() => setShowRehearsal(true)}
      onOpenScrapbook={() => setShowScrapbook(true)}
      foundCount={foundCardIds.length}
    >
      {/* View Router */}
      {gameState === 'gateway' && <ScreenGateway onAccept={handleAcceptGateway} />}

      {gameState === 'prank' && <ScreenPrank onUnlocked={handlePrankUnlocked} />}

      {gameState === 'vault' && currentVault && (
        <ScreenVault
          vault={currentVault}
          collectedLetters={collectedTokens}
          onVaultUnlocked={handleVaultUnlocked}
        />
      )}

      {gameState === 'finale' && (
        <ScreenFinale
          onRestart={() => {
            localStorage.clear();
            setFoundCardIds([]);
            setCurrentStep(1);
            setGameState('gateway');
          }}
          onOpenScrapbook={() => setShowScrapbook(true)}
        />
      )}

      {/* Static 2D Doodle Mini-Me in Cinematic Bottom CaptionRail */}
      {gameState !== 'finale' && (
        <CaptionRail
          speech={miniMeSpeech}
          speakerName="Gokul (Mini-Me)"
          avatarSrc="/avatar.png"
          accentColor={activeAccent}
          onAvatarTap={() => sound.playVoice('voice_tap_yay')}
        />
      )}

      {/* Secret Rehearsal Modal for Testing */}
      {showRehearsal && (
        <RehearsalModal
          currentStep={currentStep}
          onJumpToStep={handleJumpToStep}
          onClose={() => setShowRehearsal(false)}
        />
      )}

      {/* Living Glass Memory Scrapbook Modal */}
      <ScrapbookModal
        foundCardIds={foundCardIds}
        currentStep={currentStep}
        isOpen={showScrapbook}
        onClose={() => setShowScrapbook(false)}
      />
    </DeviceFrame>
  );
}
