import React, { useState, useEffect } from 'react';
import { DeviceFrame } from './components/DeviceFrame';
import { CaptionRail } from './components/CaptionRail';
import { ScreenGateway } from './components/ScreenGateway';
import { ScreenPrank } from './components/ScreenPrank';
import { ScreenHuntStep } from './components/ScreenHuntStep';
import { ScreenVault } from './components/ScreenVault';
import { ScreenFinale } from './components/ScreenFinale';
import { RehearsalModal } from './components/RehearsalModal';
import { HUNT_CARDS, HUNT_VAULTS, CardItem, CHAPTER_CONFIG } from './data/huntData';
import { sound } from './utils/sound';

type GameState = 'gateway' | 'prank' | 'hunt' | 'vault' | 'finale';

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

  const [currentStep, setCurrentStep] = useState<number>(() => {
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
  });

  // Unique list of card IDs found - prevents any token duplication
  const [foundCardIds, setFoundCardIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('project_ar_found_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const [showRehearsal, setShowRehearsal] = useState(false);

  // Compute strictly deduplicated tokens from found cards
  const collectedTokens = React.useMemo(() => {
    const tokens: string[] = [];
    foundCardIds.forEach((cardId) => {
      const card = HUNT_CARDS.find((c) => c.id === cardId);
      if (card) {
        card.letters
          .split('-')
          .map((l) => l.trim().toUpperCase())
          .filter((l) => l.length > 0)
          .forEach((letter) => tokens.push(letter));
      }
    });
    return tokens;
  }, [foundCardIds]);

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
  };

  const handlePrankUnlocked = () => {
    setGameState('hunt');
    setCurrentStep(1);
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
        setCurrentStep((prev) => prev - 1);
      } else {
        setGameState('gateway');
      }
    } else if (gameState === 'vault') {
      setCurrentStep((prev) => prev - 1);
      setGameState('hunt');
    }
  };

  // Rehearsal quick jump
  const handleJumpToStep = (stepNumber: number) => {
    if (stepNumber === 0) {
      setGameState('gateway');
      setCurrentStep(1);
    } else if (stepNumber === 10 || stepNumber === 20 || stepNumber === 30) {
      // Seed all cards up to this vault into foundCardIds
      const prevCardIds = HUNT_CARDS.filter((c) => c.step < stepNumber).map((c) => c.id);
      setFoundCardIds(prevCardIds);
      setCurrentStep(stepNumber);
      setGameState('vault');
    } else if (stepNumber === 31) {
      setCurrentStep(31);
      setGameState('finale');
    } else {
      setCurrentStep(stepNumber);
      setGameState('hunt');
    }
  };

  // Derive active card or vault data
  const currentCard = HUNT_CARDS.find((c) => c.step === currentStep) || HUNT_CARDS[0];
  const currentVault = HUNT_VAULTS.find((v) => v.step === currentStep) || HUNT_VAULTS[0];

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
          onCardFound={handleCardFound}
          onBack={handleBackNavigation}
          onOpenRehearsal={() => setShowRehearsal(true)}
        />
        {showRehearsal && (
          <RehearsalModal
            currentStep={currentStep}
            onJumpToStep={handleJumpToStep}
            onClose={() => setShowRehearsal(false)}
          />
        )}
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
    </DeviceFrame>
  );
}
