import os
import xml.etree.ElementTree as ET
import json

def parse_xosc_file(file_path):
    tree = ET.parse(file_path)
    root = tree.getroot()
    return root

def collect_xosc_files(directory):
    xosc_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.xosc'):
                xosc_files.append(os.path.join(root, file))
    return xosc_files


# Generate training examples

def extract_sequences(xml_element, window_size=3):
    sequences = []
    elements = list(xml_element.iter())
    for i in range(len(elements) - window_size):
        input_seq = elements[i:i+window_size]
        output_seq = elements[i+window_size]
        sequences.append((input_seq, output_seq))
    return sequences


# Format the Data for Training
def xml_elements_to_text(elements):
    # Convert each element to XML string
    element_texts = [ET.tostring(elem, encoding='unicode') for elem in elements]
    
    # Replace escaped newlines and tabs with actual \n and \t

    element_texts = [text.replace('\\n', '\n').replace('\\t', '\t') for text in element_texts]
    
    # Join all the XML strings with a space separator
    return ' '.join(element_texts)


def create_dataset(sequences):
    dataset = []
    for input_seq, output_seq in sequences:
        print(input_seq)
        print(output_seq)
        input_text = xml_elements_to_text(input_seq)
        output_text = xml_elements_to_text([output_seq])
        dataset.append({'input': input_text, 'output': output_text})
    return dataset


# Function to extract XML elements from input based on output
def extract_xml_elements(data):
    extracted_elements = []
    
    for item in data:
        input_xml = item["input"]
        output_xml = item["output"]
        
        # Parse XML from input
        root = ET.fromstring(input_xml)
        
        # Match output XML element in the parsed XML
        found_element = None
        for element in root.iter():
            if ET.tostring(element, encoding='unicode') == output_xml:
                found_element = element
                break
        
        if found_element is not None:
            extracted_elements.append(ET.tostring(found_element, encoding='unicode'))
        else:
            extracted_elements.append(None)
    
    return extracted_elements



if __name__ == "__main__":
    with open(r"D:/Project/llm-ai-copilot/extension/src/server/local_llm_server/dataset/train/xosc/xosc_training_dataset.json", 'r') as f:
        dataset_json = json.load(f)
        print("datat tyoe", type(dataset_json))
    extracted_ele = extract_xml_elements(dataset_json)


