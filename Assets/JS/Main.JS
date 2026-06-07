const CONFIG = {
	// Maximum Number of Words Selected for a Single Practice Session
	WORDS_PER_SESSION: 20,

	// Probability of Showing the Question Before the Answer (E.G., 0.75 = 75% Chance)
	Q_TO_A_RATIO: 0.75,

	// Points Added to the Word's Score Upon a Correct Answer (Remember)
	REWARD_POINTS: 1,

	// Points Deducted from the Word's Score Upon an Incorrect Answer (Forgot)
	PENALTY_POINTS: -20,

	// Font Rendering Mode for KleeOne (Japanese/English Font Compatibility)
	// 0 = International Mode: KleeOne is Used ONLY for Japanese Characters. English/European Text Uses Default Fonts
	// 1 = Japanese + English Mode: KleeOne is Used for BOTH Japanese and Standard English Text
	// 2 = Disabled Mode: KleeOne is Completely Turned OFF. Universal System Fonts are Used EveryWhere
	FONT_MODE: 0,

	// Priority Weights Based on Word Scores. Higher Weight Means the Word Appears More Rrequently
	// The Algorithm Scans from Top to Bottom and Picks the First Matching Rule.
	PRIORITIES: [
		{ UpToScore: 10,  Weight: 500 },
		{ UpToScore: 50,  Weight: 25 },
		{ UpToScore: Infinity, Weight: 5 }
	]
};



let IsInputBlocked = false;
let MainDB = [];
let SessionDeck = [];
let CurrentCardIndex = 0;

const LoadBTN = document.getElementById('BTN-LOAD');
const LoadINP = document.getElementById('INP-LOAD');
const ExecBTN = document.getElementById('BTN-EXEC');
const ShowBTN = document.getElementById('BTN-SHOW');
const SaveBTN = document.getElementById('BTN-SAVE');
const ActionButtons = document.getElementById('ACTION-BUTTONS');
const AnswerContainer = document.getElementById('ANSWER-CONTAINER');
const ForgotBTN = document.getElementById('BTN-FAIL');
const RememberBTN = document.getElementById('BTN-TRUE');
const WordQuestion = document.getElementById('WORD-QUESTION');
const WordAnswer = document.getElementById('WORD-ANSWER');
const ProgressText = document.getElementById('TEXT-PROGRESS');



function TriggerInputCoolDown() {
	IsInputBlocked = true;
	setTimeout(() => {
		IsInputBlocked = false;
	}, 500);
}



async function ApplyFontConfig() {
	let StyleTag = document.getElementById('DYNAMIC-FONT-STYLE');

	if (CONFIG.FONT_MODE === 2) {
		if (StyleTag) StyleTag.remove();
		return;
	}

	if (!StyleTag) {
		StyleTag = document.createElement('style');
		StyleTag.id = 'DYNAMIC-FONT-STYLE';
		document.head.appendChild(StyleTag);
	}

	const FontURL = 'Assets/Fonts/KleeOne-SemiBold.TTF';
	const FontSRC = `URL('${FontURL}') FORMAT('TRUETYPE')`;
	let UnicodeRange = '';

	if (CONFIG.FONT_MODE === 0) {
		UnicodeRange = 'UNICODE-RANGE: U+3000-303F, U+3040-309F, U+30A0-30FF, U+4E00-9FAF;';
	} else if (CONFIG.FONT_MODE === 1) {
		UnicodeRange = 'UNICODE-RANGE: U+0020-007F, U+3000-303F, U+3040-309F, U+30A0-30FF, U+4E00-9FAF;';
	}

	StyleTag.textContent = `
		@FONT-FACE {
			FONT-FAMILY: 'KLEEONE';
			SRC: ${FontSRC};
			FONT-WEIGHT: NORMAL;
			FONT-STYLE: NORMAL;
			${UnicodeRange}
		}
	`;

	try {
		if (document.fonts) {
			await document.fonts.load(`1EM KLEEONE`);
		}
	} catch (Err) {
		WordQuestion.textContent = 'FONT ERROR';
		WordAnswer.textContent = Err.message.toUpperCase();
	}
}



async function ParseFileToDictionary(Text) {
	const Lines = Text.split(/\r?\n/);
	const ResultDB = [];

	let ContentStarted = false;

	for (let I = 0; I < Lines.length; I++) {
		const Line = Lines[I];
		const Trimmed = Line.trim();

		if (!ContentStarted && Trimmed === '') {
			continue;
		}

		ContentStarted = true;

		if (Trimmed.startsWith('#CONFIG')) {
			const Parts = Trimmed.split('|');
			Parts.forEach(Part => {
				const [Key, Value] = Part.split(':').map(S => S.trim());
				if (!Key || !Value) return;
				if (Key === 'WORDS') CONFIG.WORDS_PER_SESSION = parseInt(Value, 10) || CONFIG.WORDS_PER_SESSION;
				if (Key === 'RATIO') CONFIG.Q_TO_A_RATIO = parseFloat(Value) || CONFIG.Q_TO_A_RATIO;
				if (Key === 'REWARD') CONFIG.REWARD_POINTS = parseInt(Value, 10) || CONFIG.REWARD_POINTS;
				if (Key === 'PENALTY') CONFIG.PENALTY_POINTS = parseInt(Value, 10) || CONFIG.PENALTY_POINTS;
				if (Key === 'FONT') {
					const ParsedFont = parseInt(Value, 10);
					if ([0, 1, 2].includes(ParsedFont)) CONFIG.FONT_MODE = ParsedFont;
				}
			});
			if (I + 1 < Lines.length && Lines[I + 1].trim() === '') {
				I++; 
			}
			continue;
		}

		if (Line.includes('|')) {
			const Parts = Line.split('|');
			const Q = Parts[0] ? Parts[0].trim() : '';
			const A = Parts[1] ? Parts[1].trim() : '';
			const S = Parts[2] ? parseInt(Parts[2].trim(), 10) || 0 : 0;
			if (Q !== '' && A !== '') {
				ResultDB.push({ Q, A, S });
				continue;
			}
		}

		ResultDB.push(Line);
	}

	await ApplyFontConfig();

	return ResultDB;
}

function ConvertDictionaryToText() {
	const ConfigLine = `#CONFIG | WORDS: ${CONFIG.WORDS_PER_SESSION} | RATIO: ${CONFIG.Q_TO_A_RATIO} | REWARD: ${CONFIG.REWARD_POINTS} | PENALTY: ${CONFIG.PENALTY_POINTS} | FONT: ${CONFIG.FONT_MODE}`;

	const DictionaryLines = MainDB.map(Item => {
		if (typeof Item === 'object' && Item !== null) {
			return `${Item.Q} | ${Item.A} | ${Item.S}`;
		}
		return Item;
	});

	let FinalLines = [ConfigLine, '', ...DictionaryLines];

	while (FinalLines.length > 0 && typeof FinalLines[FinalLines.length - 1] === 'string' && FinalLines[FinalLines.length - 1].trim() === '') {
		FinalLines.pop(); 
	}

	return FinalLines.join('\n');
}



function CreateSessionDeck() {
	const TargetCount = Math.min(CONFIG.WORDS_PER_SESSION, MainDB.length);
	SessionDeck = []; 

	let Pool = [];
	for (let i = 0; i < MainDB.length; i++) {
		const Item = MainDB[i];
		if (typeof Item === 'object' && Item !== null) {
			const Rule = CONFIG.PRIORITIES.find(P => Item.S <= P.UpToScore);
			Pool.push({
				ID: i,
				Weight: Rule ? Rule.Weight : 5
			});
		}
	}

	let TotalWeight = Pool.reduce((Sum, Item) => Sum + Item.Weight, 0);

	while (SessionDeck.length < TargetCount && Pool.length > 0) {
		if (TotalWeight <= 0) break;

		let RandomValue = Math.random() * TotalWeight;
		let SelectedIndex = Pool.length - 1;
		let CountedWeight = 0;

		for (let i = 0; i < Pool.length; i++) {
			CountedWeight += Pool[i].Weight;
			if (RandomValue <= CountedWeight) {
				SelectedIndex = i;
				break;
			}
		}

		const SelectedItem = Pool[SelectedIndex];
		const IsReverse = Math.random() >= CONFIG.Q_TO_A_RATIO;

		SessionDeck.push({
			ID: SelectedItem.ID,
			IsReverse: IsReverse,
			UserResult: null
		});
		TotalWeight -= SelectedItem.Weight;
		Pool.splice(SelectedIndex, 1);
	}

	CurrentCardIndex = 0;
}



function RenderCard() {
	if (SessionDeck.length === 0) return;

	if (CurrentCardIndex >= SessionDeck.length) {
		EndSession();
		return;
	}

	ProgressText.textContent = `${CurrentCardIndex + 1} / ${SessionDeck.length}`;

	const CurrentCard = SessionDeck[CurrentCardIndex];
	const OriginalWord = MainDB[CurrentCard.ID]; 

	if (CurrentCard.IsReverse) {
		WordQuestion.textContent = OriginalWord.Q;
		WordAnswer.textContent = OriginalWord.A;
	} else {
		WordQuestion.textContent = OriginalWord.A;
		WordAnswer.textContent = OriginalWord.Q;
	}

	ResetToQuestionPhase(); 
}

function HandleUserAnswer(IsRemembered) {
	if (IsInputBlocked) return;

	TriggerInputCoolDown();

	SessionDeck[CurrentCardIndex].UserResult = IsRemembered;

	if (IsRemembered === false) {
		const CurrentCard = SessionDeck[CurrentCardIndex];
		
		SessionDeck.push({
			ID: CurrentCard.ID,
			IsReverse: CurrentCard.IsReverse,
			UserResult: null
		});
	}

	CurrentCardIndex++;
	RenderCard();
}



function FileLoadedPhase(WordsCount) {
	LoadBTN.classList.add('HIDDEN');
	ExecBTN.classList.remove('HIDDEN'); 

	WordQuestion.textContent = "DICTIONARY LOADED";
	WordAnswer.textContent = `Total Words Available: ${WordsCount}`;

	const SessionSize = Math.min(CONFIG.WORDS_PER_SESSION, WordsCount);
	ProgressText.textContent = `0 / ${SessionSize}`;
}

function StartPracticePhase() {
	if (IsInputBlocked) return;

	TriggerInputCoolDown();

	ExecBTN.classList.add('HIDDEN');
	ShowBTN.classList.remove('HIDDEN');
	AnswerContainer.classList.add('INVISIBLE');

	CreateSessionDeck();
	RenderCard();
}

function ResetToQuestionPhase() {
	ActionButtons.classList.add('HIDDEN');
	ShowBTN.classList.remove('HIDDEN');
	AnswerContainer.classList.add('INVISIBLE');
}

function ShowAnswerPhase() {
	if (IsInputBlocked) return;

	TriggerInputCoolDown();

	ShowBTN.classList.add('HIDDEN');
	ActionButtons.classList.remove('HIDDEN');
	AnswerContainer.classList.remove('INVISIBLE');
}

function EndSession() {
	SessionDeck.forEach(Card => {
		const MainWord = MainDB[Card.ID];

		if (typeof MainWord === 'object' && MainWord !== null) {
			if (Card.UserResult === true) {
				MainWord.S += CONFIG.REWARD_POINTS;
			} else if (Card.UserResult === false) {
				MainWord.S += CONFIG.PENALTY_POINTS;
				if (MainWord.S < 0) MainWord.S = 0;
			}
		}
	});

	EndSessionPhase();
}

function EndSessionPhase() {
	ActionButtons.classList.add('HIDDEN'); 

	//ProgressText.textContent = '';

	const TextData = ConvertDictionaryToText();
	const BLOB = new Blob([TextData], { type: 'text/plain;charset=utf-8' });
	const DownLoadURL = URL.createObjectURL(BLOB);

	SaveBTN.href = DownLoadURL;
	SaveBTN.classList.remove('HIDDEN');

	WordQuestion.innerText = "PRACTICE COMPLETED";
	WordAnswer.innerText = "Click the Button Below\nto DownLoad\nYour UpDated File";
}



LoadBTN.addEventListener('click', () => LoadINP.click());

LoadINP.addEventListener('change', (Event) => {
	const File = Event.target.files[0];
	if (!File) return;

	const Reader = new FileReader();

	Reader.onload = async (E) => {
		try {
			const Text = E.target.result;
			MainDB = await ParseFileToDictionary(Text);
			const WordsCount = MainDB.filter(Item => typeof Item === 'object' && Item !== null).length;
			if (WordsCount > 0) {
				FileLoadedPhase(WordsCount);
			} else {
				throw new Error("No Valid Words Found in File");
			}
		} catch (Err) {
			WordQuestion.textContent = 'FILE ERROR';
			WordAnswer.textContent = Err.message.toUpperCase();
		} finally {
			LoadINP.value = '';
		}
	};

	Reader.onerror = () => {
		WordQuestion.textContent = 'FILE ERROR';
		WordAnswer.textContent = 'Could Not Read File';
		LoadINP.value = '';
	};

	Reader.readAsText(File, 'UTF-8');
});

ExecBTN.addEventListener('click', StartPracticePhase);
ShowBTN.addEventListener('click', ShowAnswerPhase);
ForgotBTN.addEventListener('click', () => HandleUserAnswer(false));
RememberBTN.addEventListener('click', () => HandleUserAnswer(true));

document.addEventListener('keydown', (E) => {
	if (E.target.tagName === 'INPUT') return;

	if (E.code === 'ArrowUp' || E.code === 'ArrowDown' || E.code === 'ArrowLeft' || E.code === 'ArrowRight') {
		E.preventDefault();
	}

	if (IsInputBlocked) return;

	if ((E.code === 'ArrowUp' || E.code === 'ArrowDown') && !ShowBTN.classList.contains('HIDDEN')) {
		E.preventDefault();
		ShowBTN.click();
		return;
	}

	if (E.code === 'ArrowLeft' && !ActionButtons.classList.contains('HIDDEN')) {
		ForgotBTN.click();
		return;
	}

	if (E.code === 'ArrowRight' && !ActionButtons.classList.contains('HIDDEN')) {
		RememberBTN.click();
		return;
	}
});