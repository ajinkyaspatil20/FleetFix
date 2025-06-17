import pdfkit
from jinja2 import Environment, FileSystemLoader
from datetime import datetime
import os

class PDFGenerator:
    def __init__(self):
        # Initialize Jinja2 environment
        template_dir = os.path.join(os.path.dirname(__file__), 'templates')
        self.env = Environment(loader=FileSystemLoader(template_dir))
        
        # Configure pdfkit options
        self.options = {
            'page-size': 'A4',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
            'encoding': 'UTF-8',
            'no-outline': None
        }
    
    def generate_maintenance_report(self, features, maintenance_need, maintenance_percentage, explanation):
        try:
            # Get the template
            template = self.env.get_template('maintenance_report.html')
            
            # Prepare template data
            template_data = {
                'generated_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'features': features,
                'maintenance_need': maintenance_need,
                'maintenance_percentage': maintenance_percentage,
                'explanation': explanation
            }
            
            # Render HTML
            html_content = template.render(**template_data)
            
            # Generate PDF
            pdf_path = os.path.join(os.path.dirname(__file__), 'temp', 'maintenance_report.pdf')
            os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
            
            # Convert HTML to PDF
            pdfkit.from_string(html_content, pdf_path, options=self.options)
            
            return pdf_path
            
        except Exception as e:
            raise Exception(f"Failed to generate PDF report: {str(e)}")