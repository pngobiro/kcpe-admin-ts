// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Global state
let courses = [];
let subjects = [];
let examSets = [];
let pastPapers = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});

// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');
    
    // Load data for the section
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'courses':
            loadCourses();
            break;
        case 'subjects':
            loadSubjects();
            break;
        case 'examsets':
            loadExamSets();
            break;
        case 'pastpapers':
            loadPastPapers();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    try {
        const [coursesRes, subjectsRes, examsetsRes, pastpapersRes] = await Promise.all([
            fetch(`${API_BASE_URL}/courses`),
            fetch(`${API_BASE_URL}/subjects`),
            fetch(`${API_BASE_URL}/examsets`),
            fetch(`${API_BASE_URL}/pastpapers`)
        ]);
        
        const coursesData = await coursesRes.json();
        const subjectsData = await subjectsRes.json();
        const examsetsData = await examsetsRes.json();
        const pastpapersData = await pastpapersRes.json();
        
        document.getElementById('coursesCount').textContent = coursesData.count || 0;
        document.getElementById('subjectsCount').textContent = subjectsData.count || 0;
        document.getElementById('examSetsCount').textContent = examsetsData.pagination?.total || examsetsData.count || 0;
        document.getElementById('pastPapersCount').textContent = pastpapersData.pagination?.total || pastpapersData.count || 0;
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        alert('Failed to load dashboard data');
    }
}

// Courses
async function loadCourses() {
    try {
        document.getElementById('coursesLoading').style.display = 'block';
        document.getElementById('coursesTable').style.display = 'none';
        
        const response = await fetch(`${API_BASE_URL}/courses`);
        const data = await response.json();
        
        if (data.success) {
            courses = data.data || [];
            displayCourses(courses);
        }
        
        document.getElementById('coursesLoading').style.display = 'none';
        document.getElementById('coursesTable').style.display = 'table';
    } catch (error) {
        console.error('Failed to load courses:', error);
        document.getElementById('coursesLoading').innerHTML = '<p style="color: red;">Failed to load courses</p>';
    }
}

function displayCourses(coursesData) {
    const tbody = document.getElementById('coursesBody');
    tbody.innerHTML = coursesData.map(course => `
        <tr>
            <td><strong>${course.name}</strong></td>
            <td>${course.level}</td>
            <td>${course.country}</td>
            <td>${course.price} ${course.currency}</td>
            <td>
                <span class="badge ${course.is_published ? 'badge-success' : 'badge-danger'}">
                    ${course.is_published ? 'Published' : 'Draft'}
                </span>
                ${course.is_free ? '<span class="badge badge-success">Free</span>' : ''}
            </td>
            <td>
                <button class="btn btn-primary btn-small" onclick='editCourse(${JSON.stringify(course)})'>Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteCourse('${course.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function openCourseModal(course = null) {
    const modal = document.getElementById('courseModal');
    const form = document.getElementById('courseForm');
    
    if (course) {
        document.getElementById('courseModalTitle').textContent = 'Edit Course';
        form.elements.name.value = course.name;
        form.elements.level.value = course.level;
        form.elements.country.value = course.country;
        form.elements.price.value = course.price;
        form.elements.description.value = course.description || '';
        form.dataset.courseId = course.id;
    } else {
        document.getElementById('courseModalTitle').textContent = 'Add Course';
        form.reset();
        delete form.dataset.courseId;
    }
    
    modal.style.display = 'block';
}

function editCourse(course) {
    openCourseModal(course);
}

async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Course deleted successfully');
            loadCourses();
        } else {
            alert('Failed to delete course: ' + data.error);
        }
    } catch (error) {
        console.error('Failed to delete course:', error);
        alert('Failed to delete course');
    }
}

// Subjects
async function loadSubjects() {
    try {
        document.getElementById('subjectsLoading').style.display = 'block';
        document.getElementById('subjectsTable').style.display = 'none';
        
        const response = await fetch(`${API_BASE_URL}/subjects`);
        const data = await response.json();
        
        if (data.success) {
            subjects = data.data || [];
            displaySubjects(subjects);
        }
        
        document.getElementById('subjectsLoading').style.display = 'none';
        document.getElementById('subjectsTable').style.display = 'table';
    } catch (error) {
        console.error('Failed to load subjects:', error);
        document.getElementById('subjectsLoading').innerHTML = '<p style="color: red;">Failed to load subjects</p>';
    }
}

function displaySubjects(subjectsData) {
    const tbody = document.getElementById('subjectsBody');
    tbody.innerHTML = subjectsData.map(subject => `
        <tr>
            <td><strong>${subject.name}</strong></td>
            <td>${subject.course_id}</td>
            <td>${subject.order_index}</td>
            <td>
                <span class="badge ${subject.is_published ? 'badge-success' : 'badge-danger'}">
                    ${subject.is_published ? 'Published' : 'Draft'}
                </span>
            </td>
            <td>
                <button class="btn btn-primary btn-small" onclick='editSubject(${JSON.stringify(subject)})'>Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteSubject('${subject.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function openSubjectModal(subject = null) {
    alert('Subject modal not implemented yet');
}

function editSubject(subject) {
    openSubjectModal(subject);
}

async function deleteSubject(subjectId) {
    alert('Delete subject not implemented yet');
}

// Exam Sets
async function loadExamSets() {
    try {
        document.getElementById('examsetsLoading').style.display = 'block';
        document.getElementById('examsetsTable').style.display = 'none';
        
        const response = await fetch(`${API_BASE_URL}/examsets`);
        const data = await response.json();
        
        if (data.success) {
            examSets = data.data || [];
            displayExamSets(examSets);
        }
        
        document.getElementById('examsetsLoading').style.display = 'none';
        document.getElementById('examsetsTable').style.display = 'table';
    } catch (error) {
        console.error('Failed to load exam sets:', error);
        document.getElementById('examsetsLoading').innerHTML = '<p style="color: red;">Failed to load exam sets</p>';
    }
}

function displayExamSets(examsetsData) {
    const tbody = document.getElementById('examsetsBody');
    tbody.innerHTML = examsetsData.map(examset => `
        <tr>
            <td><strong>${examset.name}</strong></td>
            <td>${examset.course_name || examset.course_id}</td>
            <td>${examset.year}</td>
            <td>${examset.past_papers_count || 0}</td>
            <td>
                <span class="badge ${examset.is_published ? 'badge-success' : 'badge-danger'}">
                    ${examset.is_published ? 'Published' : 'Draft'}
                </span>
            </td>
            <td>
                <button class="btn btn-primary btn-small" onclick='editExamSet(${JSON.stringify(examset)})'>Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteExamSet('${examset.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function openExamSetModal(examset = null) {
    alert('Exam set modal not implemented yet');
}

function editExamSet(examset) {
    openExamSetModal(examset);
}

async function deleteExamSet(examsetId) {
    alert('Delete exam set not implemented yet');
}

// Past Papers
async function loadPastPapers() {
    try {
        document.getElementById('pastpapersLoading').style.display = 'block';
        document.getElementById('pastpapersTable').style.display = 'none';
        
        const response = await fetch(`${API_BASE_URL}/pastpapers?limit=50`);
        const data = await response.json();
        
        if (data.success) {
            pastPapers = data.data || [];
            displayPastPapers(pastPapers);
        }
        
        document.getElementById('pastpapersLoading').style.display = 'none';
        document.getElementById('pastpapersTable').style.display = 'table';
    } catch (error) {
        console.error('Failed to load past papers:', error);
        document.getElementById('pastpapersLoading').innerHTML = '<p style="color: red;">Failed to load past papers</p>';
    }
}

function displayPastPapers(pastpapersData) {
    const tbody = document.getElementById('pastpapersBody');
    tbody.innerHTML = pastpapersData.map(paper => `
        <tr>
            <td>${paper.subject_name || paper.subject_id}</td>
            <td>${paper.exam_set_name || paper.exam_set_id}</td>
            <td>${paper.year}</td>
            <td>${paper.paper_number}</td>
            <td>${paper.paper_type}</td>
            <td>
                <span class="badge ${paper.is_published ? 'badge-success' : 'badge-danger'}">
                    ${paper.is_published ? 'Published' : 'Draft'}
                </span>
                ${paper.is_free ? '<span class="badge badge-success">Free</span>' : ''}
            </td>
            <td>
                <button class="btn btn-primary btn-small" onclick='editPastPaper(${JSON.stringify(paper)})'>Edit</button>
                <button class="btn btn-danger btn-small" onclick="deletePastPaper('${paper.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function openPastPaperModal(paper = null) {
    alert('Past paper modal not implemented yet');
}

function editPastPaper(paper) {
    openPastPaperModal(paper);
}

async function deletePastPaper(paperId) {
    alert('Delete past paper not implemented yet');
}

// Form handlers
document.getElementById('courseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const courseData = {
        name: formData.get('name'),
        level: formData.get('level'),
        country: formData.get('country'),
        price: parseFloat(formData.get('price')) || 0,
        description: formData.get('description') || '',
        is_published: 1,
        is_free: 0
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Course saved successfully');
            closeModal('courseModal');
            loadCourses();
        } else {
            alert('Failed to save course: ' + data.error);
        }
    } catch (error) {
        console.error('Failed to save course:', error);
        alert('Failed to save course');
    }
});

// Modal helpers
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
