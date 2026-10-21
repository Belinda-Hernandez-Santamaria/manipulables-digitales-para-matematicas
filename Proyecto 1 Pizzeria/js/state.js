let gameState = {
            timerEnabled: false, lives: 3, maxLives: 3, score: 0,
            inv: {}, box: {2:0,3:0,4:0,6:0,8:0}, boxHistory: [],
            round: 1, ordersPerRound: 3, currentOrderInRound: 1,
            currentOrder: null, isGameOver: false,
            history: [], roundHistory: [], currentOrderAttempts: [], roundScoreStart: 0,
            timerInterval: null, timeLeft: 0, maxTime: 60,
            tutorialActive: false, tutorialStep: 0, timerMode: 'IDLE'
        };

        let savedGameState = null;
        let mockInterval = null;
        let tutorialInactivityWarningTimer = null;
        let tutorialSkipTimer = null;
        let tutorialDialogHtml = '';
        let tutorialNextButtonVisible = true;
        let tutorialInactivityWarningVisible = false;
        let modeSelectContext = 'game';
        let tutorialContext = 'menu'; // 'menu', 'newgame', 'ingame'
