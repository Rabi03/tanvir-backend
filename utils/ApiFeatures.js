class ApiFeatures{
    constructor(query,queryStr){
        this.query= query;
        this.queryStr= queryStr;
    }

    search(){
        // const keyword=this.queryStr.keyword?{
        //     name:{
        //         $regex:this.queryStr.keyword,
        //         $options:'i'
        //     }
        // }:this.queryStr.category?{
        //     category:{
        //         $regex:this.queryStr.category,
        //         $options:'i'
        //     }
        // }:{}

        console.log(this.queryStr)

        const filterKey={...this.queryStr};
        let removeKey=['limit','page','price','rating']
        removeKey.forEach(el=>delete filterKey[el])
        if(this.queryStr.name==='null') delete filterKey['name']
        else filterKey['name']={
                    $regex:this.queryStr.name,
                    $options:'i'
                }
        console.log("After filter",filterKey)
        this.query=this.query.find({...filterKey});

        return this;
    }

    filter(){
        const filterKey={...this.queryStr};
        let removeKey=['name','limit','page']
        removeKey.forEach(el=>delete filterKey[el])

        let queryStr=JSON.stringify(filterKey);

        queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g,match=>"$"+match)
        

        this.query=this.query.find(JSON.parse(queryStr));

        return this;

    }

    resPerPage(resPerPage){
        const currentPage=Number(this.queryStr.page)||1;
        const skip=resPerPage*(currentPage-1);

        this.query=this.query.limit(resPerPage).skip(skip);

        return this;
    }
}

module.exports=ApiFeatures;