import base64
import json
from rest_framework.response import Response
from rest_framework.decorators import api_view
from base.models import Item
from .serializers import ItemSerializer
from google import genai
import os                                                                                                                                                                                                          
from dotenv import load_dotenv
from pathlib import Path
from google.genai import types
load_dotenv()
client = genai.Client(api_key=os.environ.get("GENAI_KEY"))

@api_view(['GET'])
def getData(request):
    items = Item.objects.all()
    serializer = ItemSerializer(items, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def addItem(request):
    serializer = ItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)

@api_view(['GET'])
def testAPI(request):
    response = client.models.generate_content(model="gemini-2.0-flash", contents="IS GOOGLE OR META A BETTER COMPANY?")
    return Response({"ai": response.text})

@api_view(['POST'])
def uploadPhoto(request):

    instructions = """
    You are provided an image that should contain at least one or more items of food/drink.

    Instructions:
        - Your task is to accurately identify the calories, protein, carbs, sodium, vitamin A, and vitamin C.
        - Return ONLY a plain JSON object with no markdown, code blocks, or any other formatting.
        - Do not include any text before or after the JSON.
        - The JSON should follow this exact structure NO FUCKING MARKUP OR I WILL FUCKING KILL MYSELF:
        {
            "Calories": calories_value,
            "Protein": protein_value,
            "Carbs": carbs_value,
            "Sodium": sodium_value,
            "Vitamin A": vitamin_a_value,
            "Vitamin C": vitamin_c_value
        }
    Example of correct output:
    {"Calories": 140, "Protein": 2, "Carbs": 17, "Sodium": 180, "Vitamin A": 0.02, "Vitamin C": 0.0}

    This JSON must be directly parseable by JSON.loads with no pre-processing.
    """
    
    #print(request.FILES);
    #image_file = request.FILES['image']
    #image_data = image_file.read()
    #print("Got %d bytes" % len(image_data))
    #if image_file.size == 0:
    #    return Response({"error": "Image file is empty", "size": image_data}, status=400)

    base64_image = request.data['image']
    image_data = base64.b64decode(base64_image)

    response = client.models.generate_content(
        model="gemini-1.5-pro",
        contents=[instructions, types.Part.from_bytes(data=image_data, mime_type="image/jpeg")]
    )

    json_response = json.loads(response.text)
    print(json_response)
    return Response(json_response)

    #response = client.models.generate_content(model="gemini-1.5-pro", contents=[instructions, types.Part.from_bytes(data=image_data, mime_type="image/jpeg")])
    #return Response({"ai": response.text, "message": "image received", "filename": image_file.name})


