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
};

struct DirectionalLight
{
	vec3 Direction;
	vec3 Colour;
	float Intensity;
};
// More on directional lights later.

layout(location = 0) out vec4 o_FragColour;
layout(location = 1) out vec4 o_EmissionColour;

#define MAX_POINT_LIGHTS 30
#define MAX_DIRECTIONAL_LIGHTS 10

uniform PointLight u_PointLights[MAX_POINT_LIGHTS];
uniform DirectionalLight u_DirectionalLights[MAX_DIRECTIONAL_LIGHTS];

uniform sampler2D u_TextureAlbedo;
uniform sampler2D u_TextureSpecular;
uniform sampler2D u_TextureNormal;
uniform sampler2D u_TextureMetallic;
uniform sampler2D u_TextureRoughness;
uniform sampler2D u_TextureEmission;

uniform vec3 u_CameraPosition;

in vec2 _UVsAlbedo;
in vec2 _UVsSpecular;	
in vec2 _UVsNormal;
in vec2 _UVsMetalic;
in vec2 _UVsRoughness;
in vec2 _UVsEmission;

in vec3 _WorldPosition;
in vec3 _WorldNormal;
in vec3 _CameraPosition;

in vec4 _Tint;

in mat3 _TangentBitangentNormalMatrixTransformed;

vec3 CalculatePointLight(PointLight light, vec3 normal, float roughness, float metalness, vec3 cameraVector)
{
	float Glossiness = 100.0; // Might be interchangable later.

	vec3 LightColour = light.Colour * light.Intensity;
	vec3 ToLight = light.Position - _WorldPosition;

    float LightDistance = length(ToLight);
    vec3 LightVector = ToLight / LightDistance;

    float Attenuation = 1.0 / (LightDistance * LightDistance);
    float DiffuseResult = clamp(dot(LightVector, normal), 0.0, 1.0);

    float DiffuseLight = DiffuseResult * Attenuation;

    // --- PBR

    // Oren Nayar Diffuse Light
    float OrenNayarDiffuseLight = normalize(max(0.0, dot(normal, ToLight)));
    float OrenNayarDiffuseView = normalize(max(0.0, dot(normal, cameraVector)));

    float OrenNayarDiffuseReflectanceA = 1.0 - 0.5 * roughness / (roughness + 0.33);
    float OrenNayarDiffuseReflectanceB = 0.45 * roughness / (roughness + 0.09);

    vec3 OrenNayarLightProjected = normalize(ToLight - normal * OrenNayarDiffuseLight);
    vec3 OrenNayarViewProjected = normalize(cameraVector - normal * OrenNayarDiffuseView);

    float OrenNayarCX = max(0.0, dot(OrenNayarLightProjected, OrenNayarViewProjected));

    float OrenNayarAlpha = sin(max(acos(OrenNayarDiffuseView), acos(OrenNayarDiffuseLight)));
    float OrenNayarBeta = tan(min(acos(OrenNayarDiffuseView), acos(OrenNayarDiffuseLight)));
    float OrenNayarDX = OrenNayarAlpha * OrenNayarBeta;

    // ---

     vec3 OrenNayarHalf = normalize(ToLight + cameraVector);

    float OrenNayarDiffuseHalf = max(dot(normal, OrenNayarHalf), 0.0);
    float OrenNayarDiffuseHalfSquared = OrenNayarDiffuseHalf * OrenNayarDiffuseHalf;

    float OrenNayarExponent = -(1.0 - OrenNayarDiffuseHalfSquared) / (OrenNayarDiffuseHalfSquared * roughness);
    float OrenNayarD = pow(2.71828182845904523536028747135, OrenNayarExponent) / (roughness * OrenNayarDiffuseHalfSquared * OrenNayarDiffuseHalfSquared);

    float Fresnel = metalness + (1.0 - metalness) * pow(1.0 - OrenNayarDiffuseView, 5.0);

    float OrenNayarX = 2.0 * OrenNayarDiffuseHalf / dot(cameraVector, OrenNayarHalf);
    float OrenNayarG = min(1.0, min(OrenNayarX * OrenNayarDiffuseLight, OrenNayarX * OrenNayarDiffuseView));

    float OrenNayarCookTorrence = max((OrenNayarD * OrenNayarG * Fresnel) / (OrenNayarDiffuseView * 3.1415926535897932384626433832), 0.0);


    float OrenNayarResult = OrenNayarDiffuseLight * (OrenNayarDiffuseReflectanceA + OrenNayarDiffuseReflectanceB * OrenNayarCX * OrenNayarDX);

    // ---

    vec3 SpecularColour = texture(u_TextureSpecular, _UVsSpecular).rgb * LightColour;
 
    vec3 ReflectedLight = reflect(-LightVector, normal);
    
    float Specular = pow(clamp(dot(cameraVector, ReflectedLight), 0.0, 1.0), Glossiness);
    
    float SpecularResult = min(Specular * Attenuation, 0.0);

    vec3 Result = ((SpecularResult * SpecularColour) * (OrenNayarResult + OrenNayarCookTorrence)) + ((DiffuseLight * (_Tint.rgb * LightColour)) * (OrenNayarResult + OrenNayarCookTorrence));

	return Result;
}

void main()
{
    // Normals.
    vec3 NormalMap = (texture(u_TextureNormal, _UVsNormal).rgb * 2.0) - 1.0;
    vec3 WorldNormal = normalize(_TangentBitangentNormalMatrixTransformed * _WorldNormal) * NormalMap;

    // Roughness.
    float Roughness = texture(u_TextureRoughness, _UVsRoughness).r;
    float RoughnessSquared = Roughness * Roughness;

    // Metalness
    float Metalness = texture(u_TextureMetallic, _UVsMetalic).r;

    // Camera.
    vec3 CameraVector = normalize(_CameraPosition - _WorldPosition);

    // Ambient Light.
    float AmbientStrength = 0.1;

    // Point Light Calculation.
    vec3 Result = vec3(0.0,0.0,0.0);
    for(int i = 0; i < MAX_POINT_LIGHTS; i++)
    {
        Result += CalculatePointLight(u_PointLights[i], WorldNormal, RoughnessSquared, Metalness, CameraVector);
    }

    // Out Frag
    o_FragColour = texture(u_TextureAlbedo, _UVsAlbedo) * vec4(Result, 1.0);
}


