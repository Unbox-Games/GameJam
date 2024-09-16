using System;
using BellyRub;

namespace CSharpAssembly
{
	public class DoorController: ScriptController
	{
		public  Entity m_DoorEntity                               = null;
		private SpriteComponent m_SpriteComponent                 = null;
		private SpriteAnimatorComponent m_SpriteAnimatorComponent = null;

		void Start()
		{
			if(m_DoorEntity == null)
			{
				Debug.LogError("We Have no Door ya dick head!");
				return;
			}
			
			m_SpriteComponent         = m_DoorEntity.GetComponent<SpriteComponent>();
			m_SpriteAnimatorComponent = m_DoorEntity.GetComponent<SpriteAnimatorComponent>();
		}

		void TriggerEnter(Entity other, Vector3 normal)
		{
			//play openning animation
			m_SpriteAnimatorComponent.SetCurrentAnimation(1);

			//disable collider
			
		}
		
		void TriggerExit(Entity other, Vector3 normal)
		{
			//play closing animation, (open in reverse)
			m_SpriteAnimatorComponent.SetCurrentAnimation(0);

			//enable collider
		}
	}
}