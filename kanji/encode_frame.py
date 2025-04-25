import base64
import sys

image_path = 'frame.png'
output_variable_name = 'frameImageDataUri'

try:
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    # Create a data URI
    data_uri = f"data:image/png;base64,{encoded_string}"
    # Print the TypeScript variable assignment
    print(f"const {output_variable_name} = '{data_uri}';")
    print(f"\n// Successfully encoded {image_path} to a data URI.", file=sys.stderr)
    print(f"// Copy the line above starting with 'const {output_variable_name}...' and paste it into src/lib/img.tsx", file=sys.stderr)

except FileNotFoundError:
    print(f"Error: Image file not found at {image_path}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"Error encoding image file: {e}", file=sys.stderr)
    sys.exit(1)
