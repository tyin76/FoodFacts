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
def uploadPhotoViaPostman(request):
    instructions = """
    You are provided an image that should contain at least one or more items of food/drink. 
    
    
    Instructions:
        - Your task is to accurately identiy the calories, protein, carbs, sodium, vitamin A, and vitamin C.


    Output Format:
    {
        "Calories": calories_value
        "Protein": protein_value in g
        "Carbs": carbs_value in g
        "Sodium": sodium_value in mg
        "Vitamin A": vitamin_a_value in mcg
        "Vitamin C": vitamin_c_value in mg
    }
    Should be formatted as a JSON object that can immediately be parsed by a computer. IGNORE THE MARKDOWN.
    """
    image_file = request.FILES['image']
    image_data = image_file.read()
    response = client.models.generate_content(model="gemini-2.0-flash-exp", contents=[instructions, types.Part.from_bytes(data=image_data, mime_type="image/jpeg")])
    return Response({"ai": response.text, "message": "image received", "filename": image_file.name})


