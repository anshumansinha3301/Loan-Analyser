#!/usr/bin/env python3
from flask import Flask, render_template, request, jsonify
from loan_analyser import Loan

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate_loan():
    try:
        data = request.get_json()
        principal = float(data['principal'])
        annual_rate = float(data['annual_rate']) / 100  # Convert percentage to decimal
        term_years = int(data['term_years'])
        
        loan = Loan(principal, annual_rate, term_years)
        
        response = {
            'monthly_payment': round(loan.monthly_payment(), 2),
            'total_interest': round(loan.total_interest(), 2),
            'total_amount': round(principal + loan.total_interest(), 2),
            'amortization_schedule': loan.amortization_schedule()
        }
        
        return jsonify(response)
    
    except (ValueError, KeyError) as e:
        return jsonify({'error': 'Invalid input data'}), 400

if __name__ == '__main__':
    app.run(debug=True)