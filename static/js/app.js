// DOM elements
const loanForm = document.getElementById('loanForm');
const resultsSection = document.getElementById('results');
const errorMessage = document.getElementById('errorMessage');
const monthlyPaymentElement = document.getElementById('monthlyPayment');
const totalInterestElement = document.getElementById('totalInterest');
const totalAmountElement = document.getElementById('totalAmount');
const scheduleTable = document.getElementById('scheduleTable').getElementsByTagName('tbody')[0];

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Clear previous results
function clearResults() {
    resultsSection.style.display = 'none';
    errorMessage.style.display = 'none';
    scheduleTable.innerHTML = '';
}

// Show loading state
function setLoadingState(isLoading) {
    const form = document.getElementById('loanForm');
    if (isLoading) {
        form.classList.add('loading');
    } else {
        form.classList.remove('loading');
    }
}

// Display error message
function showError(message = 'Please check your input values and try again.') {
    errorMessage.querySelector('p').textContent = message;
    errorMessage.style.display = 'block';
    resultsSection.style.display = 'none';
}

// Populate amortization schedule table
function populateSchedule(schedule) {
    scheduleTable.innerHTML = '';
    
    schedule.forEach(payment => {
        const row = scheduleTable.insertRow();
        row.innerHTML = `
            <td>${payment.month}</td>
            <td>${formatCurrency(payment.payment)}</td>
            <td>${formatCurrency(payment.principal_paid)}</td>
            <td>${formatCurrency(payment.interest_paid)}</td>
            <td>${formatCurrency(payment.remaining_balance)}</td>
        `;
    });
}

// Display results
function displayResults(data) {
    monthlyPaymentElement.textContent = formatCurrency(data.monthly_payment);
    totalInterestElement.textContent = formatCurrency(data.total_interest);
    totalAmountElement.textContent = formatCurrency(data.total_amount);
    
    populateSchedule(data.amortization_schedule);
    
    errorMessage.style.display = 'none';
    resultsSection.style.display = 'block';
    
    // Smooth scroll to results
    resultsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Validate form inputs
function validateForm(formData) {
    const { principal, annual_rate, term_years } = formData;
    
    if (principal <= 0) {
        throw new Error('Loan amount must be greater than 0');
    }
    
    if (annual_rate < 0 || annual_rate > 100) {
        throw new Error('Interest rate must be between 0% and 100%');
    }
    
    if (term_years <= 0 || term_years > 50) {
        throw new Error('Loan term must be between 1 and 50 years');
    }
    
    return true;
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    clearResults();
    setLoadingState(true);
    
    try {
        // Get form data
        const formData = new FormData(loanForm);
        const data = {
            principal: parseFloat(formData.get('principal')),
            annual_rate: parseFloat(formData.get('annual_rate')),
            term_years: parseInt(formData.get('term_years'))
        };
        
        // Validate inputs
        validateForm(data);
        
        // Send request to server
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Server error occurred');
        }
        
        const result = await response.json();
        displayResults(result);
        
    } catch (error) {
        console.error('Error calculating loan:', error);
        showError(error.message);
    } finally {
        setLoadingState(false);
    }
}

// Add real-time input validation
function addInputValidation() {
    const inputs = loanForm.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Remove any previous error styling
            this.classList.remove('error');
            
            // Basic validation feedback
            if (this.value !== '' && !this.checkValidity()) {
                this.classList.add('error');
            }
        });
        
        // Clear results when input changes
        input.addEventListener('input', clearResults);
    });
}

// Add sample data function
function addSampleData() {
    document.getElementById('principal').value = '250000';
    document.getElementById('annual_rate').value = '6.5';
    document.getElementById('term_years').value = '30';
}

// Initialize the application
function init() {
    // Add event listeners
    loanForm.addEventListener('submit', handleFormSubmit);
    addInputValidation();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Ctrl+Enter to submit form
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            loanForm.dispatchEvent(new Event('submit'));
        }
        
        // Ctrl+R to add sample data (for demo purposes)
        if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            addSampleData();
        }
    });
    
    // Focus on first input
    document.getElementById('principal').focus();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add error styling to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    .form-group input.error {
        border-color: #e74c3c !important;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
    }
`;
document.head.appendChild(style);