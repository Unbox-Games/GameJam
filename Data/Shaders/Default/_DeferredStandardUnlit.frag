#version 450 core

/*
	Note: Variable Naming Conventions.
	
	 - a_Variable = Attribute Type Variable.
	 - u_Variable = Uniform Type Variable.
	 - o_Variable = Out Type Variable.
	 - _Variable = Out - In Type Variable.
	 - Variable = Local Scope Type Variable.
*/

struct PointLight
{
	vec3 Position;
	vec3 Colour;
	float Intensity;
    float Range;
};

struct DirectionalLight
{
	vec3 Direction;
	vec3 Colour;
	float Intensity;
};

struct SpotLight
{
	vec3 Position;
	vec3 Direction;
	vec3 Colour;
	float Range;
	float Intensity;
	float Radius;
	float OuterRadius;
};

layout(location = 0) out vec4 o_FragColour;
layout(location = 1) out vec4 o_EmissionColour;

#define MAX_POINT_LIGHTS 30
#define MAX_SPOT_LIGHTS 30
#define MAX_DIRECTIONAL_LIGHTS 5

#define CONSTANT 1.0
#define LINEAR 0.09
#define QUADRATIC 0.032

// All Light Types.
uniform PointLight u_PointLights[MAX_POINT_LIGHTS];
uniform SpotLight u_SpotLights[MAX_SPOT_LIGHTS];
uniform DirectionalLight u_DirectionalLights[MAX_DIRECTIONAL_LIGHTS];

uniform int u_PointLightsUsed = 0;
uniform int u_SpotLightsUsed = 0;
uniform int u_DirectionalLightsUsed = 0;

uniform sampler2D u_TextureAlbedo;
uniform sampler2D u_TextureSpecular;
uniform sampler2D u_TextureNormal;
uniform sampler2D u_TextureMetallic;
uniform sampler2D u_TextureRoughness;
uniform sampler2D u_TextureEmission;

uniform float u_Glossiness = 30.0;

in vec2 _UVsAlbedo;
in vec2 _UVsSpecular;	
in vec2 _UVsNormal;
in vec2 _UVsMetalic;
in vec2 _UVsRoughness;
in vec2 _UVsEmission;

in vec3 _WorldPosition;
in vec3 _WorldNormal;
in mat3 _TBNMatrix;
in vec3 _CameraVector;

in vec4 _Tint;

vec3 CalculatePointLight(PointLight light, vec3 normal, vec3 viewDir)
{
    vec3 lightDir = normalize(light.Position - _WorldPosition);
    float diff = max(dot(normal, lightDir), 0.0);

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_Glossiness);
    
    float Distance = length(light.Position - _WorldPosition);
    
    float attenuation = light.Range / (CONSTANT + LINEAR * Distance + QUADRATIC * (Distance * Distance));    

    vec3 diffuse = diff * texture(u_TextureAlbedo, _UVsAlbedo).xyz;
    vec3 specular = spec * texture(u_TextureSpecular, _UVsSpecular).xyz;
    diffuse *= attenuation;
    specular *= attenuation;
    return ((diffuse + specular) * _Tint.xyz * light.Colour) * light.Intensity;
}

vec3 CalculateDirectionalLight(DirectionalLight light, vec3 normal, vec3 viewDir)
{
	vec3 lightDir = normalize(light.Direction);
	//diffuse shading
	float diff = max(dot(normal, lightDir), 0.0);
	//specular shading
	vec3 reflectDir = reflect(-lightDir, normal);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_Glossiness);
	
	//combine results. Keep in mind that the below lines differs from LearnOpenGL.
	vec3 diffuse = diff * texture(u_TextureAlbedo, _UVsAlbedo).xyz;
	vec3 specular = spec * texture(u_TextureSpecular, _UVsSpecular).xyz;
	
	return ((diffuse + specular) * _Tint.xyz * light.Colour) * light.Intensity;
}

vec3 CalculateSpotLight(SpotLight light, vec3 normal, vec3 viewDir)
{   
    vec3 lightDir = normalize(light.Position - _WorldPosition);
    //diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);
    
    //sepcular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_Glossiness);
    
    //attenuation
    float Distance = length(light.Position - _WorldPosition) / light.Range;
    float attenuation = 1.0 / (CONSTANT + LINEAR * Distance + QUADRATIC * (Distance * Distance));
    
    //spotlight intensity
    float theta = dot(lightDir, normalize(light.Direction));
    float epsilon = light.Radius - light.OuterRadius;
    float intensity = clamp((theta - light.OuterRadius) / epsilon, 0.0, 1.0);
    
    //combine results
    vec3 diffuse = diff * texture(u_TextureAlbedo, _UVsAlbedo).xyz;
    vec3 specular = spec * texture(u_TextureSpecular, _UVsSpecular).xyz; 
    
    diffuse *= attenuation * intensity;
    specular *= attenuation * intensity;
    
    return ((diffuse + specular) * _Tint.xyz * light.Colour) * light.Intensity;
}

void main()
{
	vec4 TextureColour = texture(u_TextureAlbedo, _UVsAlbedo);
	if(TextureColour.a == 0) discard;
    // Normals.
    vec3 NormalMap = ((texture(u_TextureNormal, _UVsNormal).rgb * 2.0) - 1.0);
   	vec3 WorldNormal = normalize(_TBNMatrix * NormalMap);
    
    vec3 Result = vec3(0,0,0);
	vec4 AmbientLight = vec4(0.01,0.01,0.01,1.0);

    for(int i = 0; i < u_DirectionalLightsUsed; i++)
    {
       	Result += CalculateDirectionalLight(u_DirectionalLights[i], WorldNormal, _CameraVector);
    }

   	for(int i = 0; i < u_PointLightsUsed; i++)
    {
      	Result += CalculatePointLight(u_PointLights[i], WorldNormal, _CameraVector);
    }
	
	for(int i = 0; i < u_SpotLightsUsed; i++)
    {
      	Result += CalculateSpotLight(u_SpotLights[i], WorldNormal, _CameraVector);
   	}
   	
	vec4 EndResultColour = vec4(Result, TextureColour.a);
	
	o_FragColour = EndResultColour;
}

