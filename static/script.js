// API endpoints
const API_URL = 'http://localhost:5000/api';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Display user info
    document.getElementById('userInfo').textContent = `Welcome, ${user.username} (${user.role})`;
    
    // Load initial data
    loadOwners();
    loadPets();
    loadAppointments();
    loadVaccinations();
    loadFeedingLogs();
    loadMedicalHistory();
});

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Add token to all fetch requests
function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    });
}

// Show/hide sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

// Modal instances
let addOwnerModal;
let addPetModal;

// Initialize modals when document is ready
document.addEventListener('DOMContentLoaded', function() {
    addOwnerModal = new bootstrap.Modal(document.getElementById('addOwnerModal'));
    addPetModal = new bootstrap.Modal(document.getElementById('addPetModal'));
    
    // Load initial data
    loadOwners();
    loadPets();
});

// Show add owner modal
function showAddOwnerModal() {
    document.getElementById('addOwnerForm').reset();
    showModal('addOwnerModal');
}

// Show add pet modal
function showAddPetModal() {
    document.getElementById('addPetForm').reset();
    loadOwnerOptions();
    showModal('addPetModal');
}

// Load owners into the table
async function loadOwners() {
    try {
        const response = await fetchWithAuth(`${API_URL}/owners`);
        const owners = await response.json();
        
        const tbody = document.getElementById('ownersTableBody');
        tbody.innerHTML = '';
        
        owners.forEach(owner => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${owner.owner_id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${owner.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${owner.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${owner.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onclick="editOwner(${owner.owner_id})" class="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
                    <button onclick="deleteOwner(${owner.owner_id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading owners:', error);
    }
}

// Load pets into the table
async function loadPets() {
    try {
        const response = await fetchWithAuth(`${API_URL}/pets`);
        const pets = await response.json();
        
        const tbody = document.getElementById('petsTableBody');
        tbody.innerHTML = '';
        
        pets.forEach(pet => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${pet.pet_id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${pet.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${pet.species}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${pet.breed}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${pet.dob}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onclick="editPet(${pet.pet_id})" class="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
                    <button onclick="deletePet(${pet.pet_id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading pets:', error);
    }
}

// Load owner options for pet form
async function loadOwnerOptions() {
    try {
        const response = await fetchWithAuth(`${API_URL}/owners`);
        const owners = await response.json();
        
        const select = document.querySelector('select[name="owner_id"]');
        select.innerHTML = '<option value="">Select Owner</option>';
        
        owners.forEach(owner => {
            const option = document.createElement('option');
            option.value = owner.owner_id;
            option.textContent = owner.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading owners:', error);
    }
}

// Add new owner
async function addOwner() {
    const form = document.getElementById('addOwnerForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetchWithAuth(`${API_URL}/owners`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (response.ok) {
            closeModal('addOwnerModal');
            form.reset();
            loadOwners();
            alert('Owner added successfully!');
        } else {
            throw new Error('Failed to add owner');
        }
    } catch (error) {
        console.error('Error adding owner:', error);
        alert('Error adding owner. Please try again.');
    }
}

// Add new pet
async function addPet() {
    const form = document.getElementById('addPetForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetchWithAuth(`${API_URL}/pets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (response.ok) {
            closeModal('addPetModal');
            form.reset();
            loadPets();
            alert('Pet added successfully!');
        } else {
            throw new Error('Failed to add pet');
        }
    } catch (error) {
        console.error('Error adding pet:', error);
        alert('Error adding pet. Please try again.');
    }
}

// Delete owner
async function deleteOwner(ownerId) {
    if (!confirm('Are you sure you want to delete this owner?')) {
        return;
    }
    
    try {
        const response = await fetchWithAuth(`${API_URL}/owners/${ownerId}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            loadOwners();
            alert('Owner deleted successfully!');
        } else {
            throw new Error('Failed to delete owner');
        }
    } catch (error) {
        console.error('Error deleting owner:', error);
        alert('Error deleting owner. Please try again.');
    }
}

// Delete pet
async function deletePet(petId) {
    if (!confirm('Are you sure you want to delete this pet?')) {
        return;
    }
    
    try {
        const response = await fetchWithAuth(`${API_URL}/pets/${petId}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            loadPets();
            alert('Pet deleted successfully!');
        } else {
            throw new Error('Failed to delete pet');
        }
    } catch (error) {
        console.error('Error deleting pet:', error);
        alert('Error deleting pet. Please try again.');
    }
}

// Show modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Load data functions
async function loadAppointments() {
    try {
        const response = await fetchWithAuth(`${API_URL}/appointments`);
        const appointments = await response.json();
        const tbody = document.getElementById('appointmentsTableBody');
        tbody.innerHTML = appointments.map(appointment => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${appointment.appointment_id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${appointment.pet_name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${appointment.appointment_date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${appointment.reason}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${appointment.vet_name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${appointment.status}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onclick="editAppointment(${appointment.appointment_id})" class="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
                    <button onclick="deleteAppointment(${appointment.appointment_id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

async function loadVaccinations() {
    try {
        const response = await fetchWithAuth(`${API_URL}/vaccinations`);
        const vaccinations = await response.json();
        const tbody = document.getElementById('vaccinationsTableBody');
        tbody.innerHTML = vaccinations.map(vaccination => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${vaccination.vaccine_id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${vaccination.pet_name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${vaccination.vaccine_name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${vaccination.vaccination_date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${vaccination.next_due_date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onclick="editVaccination(${vaccination.vaccine_id})" class="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
                    <button onclick="deleteVaccination(${vaccination.vaccine_id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading vaccinations:', error);
    }
}

async function loadFeedingLogs() {
    try {
        const response = await fetchWithAuth(`${API_URL}/feedinglogs`);
        const feedingLogs = await response.json();
        const tbody = document.getElementById('feedingLogsTableBody');
        tbody.innerHTML = feedingLogs.map(log => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${log.feeding_id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${log.pet_name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${log.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${log.food_type}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${log.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onclick="editFeedingLog(${log.feeding_id})" class="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
                    <button onclick="deleteFeedingLog(${log.feeding_id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading feeding logs:', error);
    }
}

async function loadMedicalHistory() {
    try {
        const response = await fetchWithAuth(`${API_URL}/medicalhistory`);
        const medicalHistory = await response.json();
        const tbody = document.getElementById('medicalHistoryTableBody');
        tbody.innerHTML = medicalHistory.map(record => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.history_id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.pet_name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.record_date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.symptom}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.diagnosis}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.treatment}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onclick="editMedicalHistory(${record.history_id})" class="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
                    <button onclick="deleteMedicalHistory(${record.history_id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading medical history:', error);
    }
}

// Utility: Populate all pet selects in modals
async function populateAllPetSelects() {
    try {
        const response = await fetchWithAuth(`${API_URL}/pets`);
        const pets = await response.json();
        document.querySelectorAll("select[name='pet_id']").forEach(select => {
            select.innerHTML = '<option value="">Select a pet</option>';
            pets.forEach(pet => {
                const option = document.createElement('option');
                option.value = pet.pet_id;
                option.textContent = pet.name;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Error loading pets for select:', error);
    }
}

// Show add appointment modal
function showAddAppointmentModal() {
    populateAllPetSelects();
    showModal('addAppointmentModal');
}

// Show add vaccination modal
function showAddVaccinationModal() {
    populateAllPetSelects();
    showModal('addVaccinationModal');
}

// Show add feeding log modal
function showAddFeedingLogModal() {
    populateAllPetSelects();
    showModal('addFeedingLogModal');
}

// Show add medical history modal
function showAddMedicalHistoryModal() {
    populateAllPetSelects();
    showModal('addMedicalHistoryModal');
}

// Add new appointment
async function addAppointment() {
    const form = document.getElementById('addAppointmentForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetchWithAuth(`${API_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            closeModal('addAppointmentModal');
            form.reset();
            loadAppointments();
        } else {
            throw new Error('Failed to add appointment');
        }
    } catch (error) {
        console.error('Error adding appointment:', error);
    }
}

// Add new vaccination
async function addVaccination() {
    const form = document.getElementById('addVaccinationForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetchWithAuth(`${API_URL}/vaccinations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            closeModal('addVaccinationModal');
            form.reset();
            loadVaccinations();
        } else {
            throw new Error('Failed to add vaccination');
        }
    } catch (error) {
        console.error('Error adding vaccination:', error);
    }
}

// Add new feeding log
async function addFeedingLog() {
    const form = document.getElementById('addFeedingLogForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetchWithAuth(`${API_URL}/feedinglogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            closeModal('addFeedingLogModal');
            form.reset();
            loadFeedingLogs();
        } else {
            throw new Error('Failed to add feeding log');
        }
    } catch (error) {
        console.error('Error adding feeding log:', error);
    }
}

// Add new medical history
async function addMedicalHistory() {
    const form = document.getElementById('addMedicalHistoryForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetchWithAuth(`${API_URL}/medicalhistory`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            closeModal('addMedicalHistoryModal');
            form.reset();
            loadMedicalHistory();
        } else {
            throw new Error('Failed to add medical history');
        }
    } catch (error) {
        console.error('Error adding medical history:', error);
    }
} 
// Delete appointment
async function deleteAppointment(id) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
        const response = await fetchWithAuth(`${API_URL}/appointments/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadAppointments();
        }
    } catch (error) {
        console.error('Error deleting appointment:', error);
    }
}

// Delete vaccination
async function deleteVaccination(id) {
    if (!confirm('Are you sure you want to delete this vaccination?')) return;
    try {
        const response = await fetchWithAuth(`${API_URL}/vaccinations/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadVaccinations();
        }
    } catch (error) {
        console.error('Error deleting vaccination:', error);
    }
}

// Delete feeding log
async function deleteFeedingLog(id) {
    if (!confirm('Are you sure you want to delete this feeding log?')) return;
    try {
        const response = await fetchWithAuth(`${API_URL}/feedinglogs/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadFeedingLogs();
        }
    } catch (error) {
        console.error('Error deleting feeding log:', error);
    }
}

// Delete medical history
async function deleteMedicalHistory(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
        const response = await fetchWithAuth(`${API_URL}/medicalhistory/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadMedicalHistory();
        }
    } catch (error) {
        console.error('Error deleting medical history:', error);
    }
}