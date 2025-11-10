

/**
 * Global store for fetched project data.
 * @type {Array<Object>}
 */
let projectsData = [];


const PLACEHOLDERS = {
    card: 'images/card_placeholder_bg.webp',
    spotlight: 'images/spotlight_placeholder_bg.webp'
};

const VALIDATION_REGEX = {
    illegalChars: /[^a-zA-Z0-9@._-]/,
    validEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

const MAX_MESSAGE_LENGTH = 300;

const aboutMeSection = document.getElementById('aboutMe');
const projectsListContainer = document.getElementById('projectList');
const spotlightSection = document.getElementById('projectSpotlight');
const spotlightContentContainer = document.getElementById('spotlightTitles'); 
const navPrev = document.querySelector('.arrow-left');
const navNext = document.querySelector('.arrow-right');
const contactForm = document.getElementById('formSection'); 
const emailInput = document.getElementById('contactEmail'); 
const messageInput = document.getElementById('contactMessage'); 
const emailError = document.getElementById('emailError');
const messageError = document.getElementById('messageError');
const charCount = document.getElementById('charactersLeft');

document.addEventListener('DOMContentLoaded', async () => {
    const [aboutData, projects] = await Promise.all([
        fetchData('data/aboutMeData.json'),
        fetchData('data/projectsData.json')
    ]);

    projectsData = projects || [];

    if (aboutData) {
        populateAboutMe(aboutData);
    }

    if (projectsData.length > 0) {
        populateProjects(projectsData);
        updateSpotlight(projectsData[0].project_id);
    }

    addEventListeners();
});

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return null; 
    }
}

function populateAboutMe(data) {
    if (!aboutMeSection) return;

    const bio = data.aboutMe || "Welcome to my portfolio.";
    const headshotSrc = data.headshot || PLACEHOLDERS.card; 

    const bioParagraph = document.createElement('p');
    bioParagraph.textContent = bio;

    const headshotContainer = document.createElement('div');
    headshotContainer.className = 'headshotContainer';
    const headshotImage = document.createElement('img');
    headshotImage.src = headshotSrc;
    headshotImage.alt = "Portfolio headshot";
    headshotContainer.appendChild(headshotImage);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(bioParagraph);
    fragment.appendChild(headshotContainer);
    
    aboutMeSection.innerHTML = ''; 
    aboutMeSection.appendChild(fragment);
}

function populateProjects(projects) {
    if (!projectsListContainer) return;

    const fragment = document.createDocumentFragment();

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'projectCard';
        projectCard.dataset.id = project.project_id; 

        const cardImage = project.card_image || PLACEHOLDERS.card;
        projectCard.style.backgroundImage = `url(${cardImage})`;

        const title = document.createElement('h4');
        title.textContent = project.project_name || "Project Title";

        const description = document.createElement('p');
        description.textContent = project.short_description || "Click to learn more.";

        projectCard.appendChild(title);
        projectCard.appendChild(description);
        fragment.appendChild(projectCard);
    });

    projectsListContainer.innerHTML = '';
    projectsListContainer.appendChild(fragment);
}

function updateSpotlight(projectId) {
    const project = projectsData.find(p => p.project_id === projectId);
    if (!project) {
        console.warn(`Project with ID ${projectId} not found.`);
        return;
    }

    spotlightContentContainer.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = project.project_name || "Project Spotlight";

    const description = document.createElement('p');
    description.textContent = project.long_description || "More details about this project are coming soon.";

    const link = document.createElement('a');
    link.href = project.url || '#';
    link.textContent = "Click here to see more...";
 
    if (project.url) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
    }

    const fragment = document.createDocumentFragment();
    fragment.appendChild(title);
    fragment.appendChild(description);
    fragment.appendChild(link);
    spotlightContentContainer.appendChild(fragment);

    const spotlightImage = project.spotlight_image || PLACEHOLDERS.spotlight;
    spotlightSection.style.backgroundImage = `url(${spotlightImage})`;
}

function addEventListeners() {
    if (projectsListContainer) {
        projectsListContainer.addEventListener('click', handleProjectClick);
    }

    if (navPrev && navNext) {
        navPrev.addEventListener('click', () => handleNavScroll('prev'));
        navNext.addEventListener('click', () => handleNavScroll('next'));
    }

    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    if (messageInput) {
        messageInput.addEventListener('input', handleCharCount);
        handleCharCount(); 
    }
}

function handleProjectClick(event) {
    const card = event.target.closest('.projectCard');
    if (card && card.dataset.id) {
        updateSpotlight(card.dataset.id);
    }
}

function handleNavScroll(direction) {
    if (!projectsListContainer) return;

    const mediaQuery = window.matchMedia('(min-width: 900px)');
    const scrollAmount = 300; 

    const options = {
        behavior: 'smooth'
    };

    if (mediaQuery.matches) {
        // Desktop - Vertical scroll
        options.top = direction === 'next' ? scrollAmount : -scrollAmount;
    } else {
        // Mobile - Horizontal scroll
        options.left = direction === 'next' ? scrollAmount : -scrollAmount;
    }
    
    projectsListContainer.scrollBy(options);
}

function handleCharCount() {
    if (!messageInput || !charCount) return;

    const count = messageInput.value.length;
    const remaining = MAX_MESSAGE_LENGTH - count;
    
    charCount.textContent = `Characters: ${count}/${MAX_MESSAGE_LENGTH}`;

    if (remaining < 0) {
        charCount.classList.add('error');
    } else {
        charCount.classList.remove('error');
    }
}

function handleFormSubmit(event) {
    event.preventDefault(); 
    if (validateForm()) {
        alert('Form validation passed! Submission successful.');
        contactForm.reset(); 
        handleCharCount(); 
    }
}

function validateForm() {
    let isValid = true;
    emailError.textContent = '';
    messageError.textContent = '';

    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (email === '') {
        emailError.textContent = 'Email address is required.';
        isValid = false;
    } else if (!VALIDATION_REGEX.validEmail.test(email)) {
        emailError.textContent = 'Please enter a valid email address (e.g., name@domain.com).';
        isValid = false;
    } else if (VALIDATION_REGEX.illegalChars.test(email)) {
        emailError.textContent = 'Email contains illegal characters.';
        isValid = false;
    }

    if (message === '') {
        messageError.textContent = 'Message is required.';
        isValid = false;
    } else if (message.length > MAX_MESSAGE_LENGTH) {
        messageError.textContent = `Message must be ${MAX_MESSAGE_LENGTH} characters or less.`;
        isValid = false;
    } else if (VALIDATION_REGEX.illegalChars.test(message)) {
        messageError.textContent = 'Message contains illegal characters (only a-z, A-Z, 0-9, @, ., _, - are allowed).';
        isValid = false;
    }

    return isValid;
}