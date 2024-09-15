#version 450 core

layout(location = 0) out vec4 o_FragColour;

in vec3 _Colour;

void main()
{
	o_FragColour = vec4(_Colour, 1.0);
}