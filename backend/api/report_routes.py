from flask import Blueprint, send_file, jsonify
from flask_jwt_extended import jwt_required
from utils.pdf_generator import PDFGenerator
import os

report_bp = Blueprint('report', __name__)
pdf_generator = PDFGenerator()

@report_bp.route('/generate-report', methods=['POST'])
@jwt_required()
def generate_maintenance_report():
    try:
        data = request.get_json()
        features = data.get('features')
        maintenance_need = data.get('maintenance_need')
        maintenance_percentage = data.get('maintenance_percentage')
        explanation = data.get('explanation')
        
        # Generate PDF report
        pdf_path = pdf_generator.generate_maintenance_report(
            features=features,
            maintenance_need=maintenance_need,
            maintenance_percentage=maintenance_percentage,
            explanation=explanation
        )
        
        # Return the PDF file
        return send_file(
            pdf_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='maintenance_report.pdf'
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500