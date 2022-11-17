package vidyaBackend.backend.models;

public class PutListBody
{
    public String list;
    public boolean add;

    public  PutListBody(String list, boolean action)
    {
        this.list = list;
        this.add = action;
    }
}
