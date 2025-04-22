
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

def train_disease_prediction_model(data_path):
    """
    Train an XGBoost model for disease prediction
    
    Parameters:
    -----------
    data_path : str
        Path to the CSV file containing training data
        
    Returns:
    --------
    model : XGBClassifier
        Trained XGBoost model
    """
    # Load data
    data = pd.read_csv(data_path)
    
    # Data preprocessing (this will depend on your actual data structure)
    # Example assumes columns like: symptoms, patient_age, patient_location, etc. with 'disease' as target
    
    # Handle missing values
    data = data.fillna(0)
    
    # Define features and target
    X = data.drop('disease', axis=1)  # All columns except 'disease'
    y = data['disease']  # Target variable
    
    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Initialize and train the XGBoost model
    model = XGBClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save the model and scaler
    joblib.dump(model, 'disease_prediction_model.pkl')
    joblib.dump(scaler, 'feature_scaler.pkl')
    
    return model, scaler

def predict_disease_outbreak(data_path, model_path='disease_prediction_model.pkl', scaler_path='feature_scaler.pkl'):
    """
    Predict disease outbreaks from new data
    
    Parameters:
    -----------
    data_path : str
        Path to the CSV file containing new data for prediction
    model_path : str
        Path to the saved model file
    scaler_path : str
        Path to the saved scaler file
        
    Returns:
    --------
    predictions : dict
        Dictionary containing prediction results with probabilities
    """
    # Load the model and scaler
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    
    # Load new data
    new_data = pd.read_csv(data_path)
    
    # Preprocess data (similar to training preprocessing)
    new_data = new_data.fillna(0)
    
    # Remove target column if present
    if 'disease' in new_data.columns:
        new_data = new_data.drop('disease', axis=1)
    
    # Scale features
    new_data_scaled = scaler.transform(new_data)
    
    # Predict disease probabilities
    probabilities = model.predict_proba(new_data_scaled)
    
    # Get the class labels
    class_labels = model.classes_
    
    # Create results
    results = []
    for i, row in enumerate(probabilities):
        row_results = []
        for j, prob in enumerate(row):
            if prob > 0.1:  # Only include diseases with probability > 10%
                row_results.append({
                    'disease': class_labels[j],
                    'probability': float(prob),
                    'location': new_data['location'].iloc[i] if 'location' in new_data.columns else 'Unknown'
                })
        
        # Sort by probability for this instance
        row_results.sort(key=lambda x: x['probability'], reverse=True)
        results.append(row_results)
    
    return results

if __name__ == "__main__":
    # Example usage
    # train_disease_prediction_model('path/to/training_data.csv')
    # predictions = predict_disease_outbreak('path/to/new_data.csv')
    # print(predictions)
    pass
